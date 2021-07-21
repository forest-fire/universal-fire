/* eslint-disable @typescript-eslint/no-unsafe-return */
import Dexie, { DexieDOMDependencies, TableSchema } from "dexie";
import { DexieError, FireModelError } from "~/errors";
import { DexieList, DexieRecord } from "~/firemodel-dexie/index";
import {
  ICompositeKey,
  IDexieModelMeta,
  IDexiePriorVersion,
  PrimaryKey,
} from "~/types";
import { ConstructorFor, IDictionary, pk } from "common-types";

import { Record } from "~/core";
import { capitalize } from "~/util";
import { IModel } from "~/types";
import { ISdk } from "@forest-fire/types";
import { keys } from "native-dash";
import { Model } from "~/models/Model";

/**
 * Provides a simple API to convert to/work with **Dexie** models
 * from a **Firemodel** model definition.
 */
export class DexieDb {
  //#region STATIC
  /**
   * Takes a _deconstructed_ array of **Firemodel** `Model` constructors and converts
   * them into a dictionary of Dexie-compatible model definitions where the _key_ to
   * the dictionary is the plural name of the model
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static modelConversion(
    ...modelConstructors: Array<ConstructorFor<IModel>>
  ) {
    if (modelConstructors.length === 0) {
      throw new FireModelError(
        `A call to DexieModel.models() was made without passing in ANY firemodel models into it! You must at least provide one model`,
        "firemodel/no-models"
      );
    }

    return modelConstructors.reduce(
      <M extends Model>(agg: IDictionary<string>, curr: ConstructorFor<M>) => {
        const dexieModel: string[] = [];
        const r = Record.create(curr);

        const compoundIndex = r.hasDynamicPath
          ? ["id"].concat(r.dynamicPathComponents)
          : "";

        if (compoundIndex) {
          dexieModel.push(`[${compoundIndex.join("+")}]`);
        }

        // UNIQUE Indexes
        (r.hasDynamicPath ? [] : ["id"])
          .concat(
            (r.META.dbIndexes || [])
              .filter((i) => i.isUniqueIndex)
              .map((i) => i.property)
          )
          .forEach((i) => dexieModel.push(`&${i}`));

        // NON-UNIQUE Indexes
        const indexes = []
          .concat(
            (r.META.dbIndexes || [])
              .filter((i) => i.isIndex && !i.isUniqueIndex)
              .map((i) => i.property)
          )
          // include dynamic props (if they're not explicitly marked as indexes)
          .concat(
            r.hasDynamicPath
              ? r.dynamicPathComponents.filter(
                (i) =>
                  !r.META.dbIndexes.map((idx) => idx.property).includes(i)
              )
              : []
          )
          .forEach((i) => dexieModel.push(i));

        // MULTI-LEVEL Indexes
        const multiEntryIndex = []
          .concat(
            r.META.dbIndexes
              .filter((i) => i.isMultiEntryIndex)
              .map((i) => i.property)
          )
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          .forEach((i) => dexieModel.push(`*${i}`));

        agg[r.pluralName] = dexieModel.join(",").trim();

        return agg;
      },
      {}
    );
  }

  /**
   * For _testing_ (or other edge cases where there is no global IDB) you may
   * pass in your own IndexDB API.
   *
   * This allows leveraging libraries such as:
   * - [fakeIndexedDB](https://github.com/dumbmatter/fakeIndexedDB)
   */
  public static indexedDB(indexedDB: any, idbKeyRange?: DexieDOMDependencies["IDBKeyRange"]): void {
    // Dexie.dependencies.indexedDB = indexedDB;
    DexieDb._indexedDb = indexedDB;
    if (idbKeyRange) {
      Dexie.dependencies.IDBKeyRange = idbKeyRange;
    }
  }

  /** if set, this library will be used instead of the globally scoped library */
  private static _indexedDb: any;

  //#endregion STATIC

  /**
   * read access to the **Dexie** model definitions
   */
  public get models() {
    return this._models;
  }

  /**
   * read access to the **IndexDB**'s _name_
   */
  public get dbName(): Readonly<string> {
    return this._name;
  }

  public get version(): number {
    return this._currentVersion;
  }

  /**
   * The models which are known to this `DexieModel` instance.
   * The names will be in the _singular_ vernacular.
   */
  public get modelNames(): string[] {
    return Object.keys(this._singularToPlural);
  }

  /**
   * The models which are known to this `DexieModel` instance.
   * The names will be in the _plural_ vernacular.
   */
  public get pluralNames(): string[] {
    return Object.keys(this._models);
  }

  public get db(): Readonly<Dexie> {
    return this._db;
  }

  public get status(): string {
    return this._status;
  }

  public get isMapped(): boolean {
    return this._isMapped;
  }

  /**
   * The tables (and schemas) which Dexie is currently managing
   * in IndexedDB.
   *
   * Note: this will throw a "not-ready" error
   * if Dexie has _not_ yet connected to the DB.
   */
  public get dexieTables(): { name: string, schema: TableSchema }[] {
    return this.db.tables.map((t) => ({
      name: t.name,
      schema: t.schema,
    }));
  }

  /** simple dictionary of Dixie model defn's for indexation */
  private _models: IDictionary<string> = {};
  private _constructors: IDictionary<ConstructorFor<Model>> = {};
  /** the core **Dexie** API surface */
  private _db: Dexie;
  /** META information for each of the `Model`'s */
  private _meta: IDictionary<IDexieModelMeta> = {};
  /** maps `Model`'s singular name to a plural */
  private _singularToPlural: IDictionary<string> = {};
  /** the current version number for the indexDB database */
  private _currentVersion = 1;
  private _priors: IDexiePriorVersion[] = [];
  /** flag to indicate whether the Dexie DB has begun the initialization */
  private _isMapped = false;

  private _status = "initialized";

  constructor(private _name: string, ...models: Array<ConstructorFor<Model>>) {
    this._models = DexieDb.modelConversion(...models);

    this._db = DexieDb._indexedDb
      ? new Dexie(this._name, { indexedDB: DexieDb._indexedDb })
      : new Dexie(this._name);

    this._db.on("blocked", () => {
      this._status = "blocked";
    });
    this._db.on("populate", () => {
      this._status = "populate";
    });
    this._db.on("ready", () => {
      this._status = "ready";
    });

    models.forEach((m) => {
      const r: Record<ISdk, Model> = Record.create(m);
      this._constructors[r.pluralName] = m;
      const meta: IDexieModelMeta = {
        ...r.META,
        modelName: r.modelName,
        hasDynamicPath: r.hasDynamicPath,
        dynamicPathComponents: r.dynamicPathComponents,
        pluralName: r.pluralName,
      };
      this._meta[r.pluralName] = meta;
      this._singularToPlural[r.modelName] = r.pluralName;
    });
  }

  /**
   * Allows the addition of prior versions of the database. This sits on top
   * of the Dexie abstraction so you get all the nice benefits of that API.
   *
   * Structurally this function conforms to the _fluent_ API style and returns
   * the `DexieDb` instance.
   *
   * Find out more from:
   * - [Dexie Docs](https://dexie.org/docs/Tutorial/Design#database-versioning)
   * - [Prior Version _typing_](https://github.com/forest-fire/firemodel/blob/master/src/%40types/dexie.ts)
   */
  public addPriorVersion(version: IDexiePriorVersion): DexieDb {
    this._priors.push(version);
    this._currentVersion++;

    return this;
  }

  /**
   * Checks whether Dexie/IndexedDB is managing the state for a given
   * `Model`
   *
   * @param model the `Model` in question
   */
  public modelIsManagedByDexie<T extends Model>(model: ConstructorFor<T>): boolean {
    const r = Record.create(model);
    return this.modelNames.includes(r.modelName);
  }

  /**
   * Returns a typed **Dexie** `Table` object for a given model class
   */
  public table<T extends Model>(
    model: ConstructorFor<T>
  ): Dexie.Table<T, PrimaryKey<T>> {
    const r = Record.create(model);

    if (!this.isOpen()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.open();
    }

    if (!this.modelIsManagedByDexie(model)) {
      throw new DexieError(
        `Attempt to get a Dexie.Table for "${capitalize(
          r.modelName
        )}" Firemodel model but this model is not being managed by Dexie! Models being managed are: ${this.modelNames.join(
          ", "
        )}`,
        "dexie/table-does-not-exist"
      );
    }

    const table = this._db.table(r.pluralName) as Dexie.Table<
      T,
      PrimaryKey<T>
    >;
    table.mapToClass(model);

    return table;
  }

  /**
   * Provides a **Firemodel**-_like_ API surface to interact with singular
   * records.
   *
   * @param model the **Firemodel** model (aka, the constructor)
   */
  public record<T extends Model>(model: ConstructorFor<T>): DexieRecord<T> {
    const r = Record.create(model);
    if (!this.modelNames.includes(r.modelName)) {
      const isPlural = this.pluralNames.includes(r.modelName);
      throw new DexieError(
        `Attempt to reach the record API via DexieDb.record("${r.modelName}") failed as there is no known Firemodel model of that name. ${isPlural
          ? "It looks like you may have accidentally used the plural name instead"
          : ""
        }. Known model types are: ${this.modelNames.join(", ")}`,
        "dexie/model-does-not-exist"
      );
    }
    if (!this.isOpen()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.open();
    }

    return new DexieRecord(
      model,
      this.table(model) as Dexie.Table<T, any>,
      this.meta(r.modelName)
    );
  }

  /**
   * Provides a very **Firemodel**-_like_ API surface to interact with LIST based
   * queries.
   *
   * @param model the **Firemodel** `Model` name
   */
  public list<T extends Model>(model: ConstructorFor<T>): DexieList<T> {
    const r = Record.create(model);
    if (!this.isOpen()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.open();
    }
    const table = r.hasDynamicPath
      ? (this.table(model) as Dexie.Table<T, ICompositeKey<T>>)
      : (this.table(model) as Dexie.Table<T, pk>);

    const meta = this.meta<T>(r.modelName);

    return new DexieList<T>(model, table, meta);
  }

  /**
   * Returns the META for a given `Model` identified by
   * the model's _plural_ (checked first) or _singular_ name.
   */
  public meta<T extends Model = Model>(name: string): IDexieModelMeta<T> {
    return this._lookupMetaWithSingularOrPluralName(this._meta, name) as unknown as IDexieModelMeta<T>;
  }

  /**
   * Returns a constructor for a given **Firemodel** `Model`
   *
   * @param name either the _plural_ or _singular_ name of a model
   * managed by the `DexieModel` instance
   */
  public modelConstructor<T extends Model = Model>(name: string): ConstructorFor<T> {
    let CTOR = this._constructors[name];
    if (!CTOR) {
      const plural = this._singularToPlural[name];
      if (plural) CTOR = this._constructors[plural];
      else throw new FireModelError(`Attempt to get model ${name}'s constructor failed`, "firemodel/invalid-model");
    }
    return CTOR as ConstructorFor<T>;
  }

  /**
   * Checks whether the connection to the **IndexDB** is open
   */
  public isOpen(): boolean {
    return this._db.isOpen();
  }

  /**
   * Sets all the defined models (as well as priors) to the
   * Dexie DB instance.
   */
  public mapModels(): void {
    this._mapVersionsToDexie();
    this._status = "mapped";
    this._isMapped = true;
  }

  /**
   * Opens the connection to the **IndexDB**.
   *
   * Note: _if the **Firemodel** models haven't yet been mapped to Dexie
   * then they will be prior to openning the connection._
   */
  public async open(): Promise<Dexie> {
    if (this._db.isOpen()) {
      throw new DexieError(
        `Attempt to call DexieDb.open() failed because the database is already open!`,
        `dexie/db-already-open`
      );
    }
    if (!this.isMapped) {
      this.mapModels();
    }
    return this._db.open();
  }

  /**
   * Closes the IndexDB connection
   */
  public close(): void {
    if (!this._db.isOpen()) {
      throw new DexieError(
        `Attempt to call DexieDb.close() failed because the database is NOT open!`,
        `dexie/db-not-open`
      );
    }
    this._db.close();
  }

  private _lookupMetaWithSingularOrPluralName(obj: IDictionary<IDexieModelMeta>, name: string) {
    if (keys(obj).includes(name)) {
      return obj[name as keyof typeof obj];
    } else {
      const plural = this._singularToPlural[name];
      if (keys(obj).includes(plural)) {
        return obj[plural as keyof typeof obj];
      } else {
        throw new FireModelError(`Attempt to lookup the Dexie::${name}'s meta data but it was not found!`, "firemodel/invalid-dexie-model")
      }
    }
  }

  private _mapVersionsToDexie() {
    this._priors.forEach((prior, idx) => {
      if (prior.upgrade) {
        this._db
          .version(idx + 1)
          .stores(prior.models)
          .upgrade(prior.upgrade);
      } else {
        this._db.version(idx).stores(prior.models);
      }
    });

    this._db.version(this._currentVersion).stores(this.models);
    this._isMapped = true;
  }
}
