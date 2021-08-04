import { DefaultDbCache, FireModel, Record } from "~/core";
import {
  IComparisonOperator,
  ISerializedQuery,
  ISdk,
  IDatabaseSdk,
  isClientSdk,
} from "@forest-fire/types";
import { SerializedQuery } from "@forest-fire/serialized-query";
import {
  IDictionary,
  epochWithMilliseconds,
  ConstructorFor,
  datetime,
} from "common-types";
import {
  IFmQueryDefn,
  IListOptions,
  IListQueryOptions,
  PrimaryKey,
  IReduxDispatch,
  IModel,
  ModelMeta
} from "~/types";
import { capitalize } from "~/util";
import { keys, pathJoin } from "native-dash";

import { FireModelError } from "~/errors";
import { arrayToHash } from "typed-conversions";
import { queryAdjustForNext, reduceOptionsForQuery } from "./lists";
import { isString } from "~/util";
import { Model } from "~/models/Model";

function addTimestamps<T extends Model>(obj: IDictionary) {
  const datetime = new Date().getTime();
  const output: IDictionary = {};
  Object.keys(obj).forEach((i) => {
    output[i] = {
      ...obj[i],
      createdAt: datetime,
      lastUpdated: datetime,
    };
  });

  return output as T;
}
export class List<S extends ISdk, T extends Model> extends FireModel<S, T> {
  //#region STATIC Interfaces

  /**
   * Sets the default database to be used by all FireModel classes
   * unless explicitly told otherwise
   */
  public static set defaultDb(db: IDatabaseSdk<ISdk>) {
    DefaultDbCache().set<IDatabaseSdk<typeof db.sdk>>(db);
  }

  public static get defaultDb(): IDatabaseSdk<ISdk> {
    return DefaultDbCache().get();
  }

  public get META(): ModelMeta<T> {
    return Record.create(this._modelConstructor).META;
  }

  // TODO: should `set` be removed?
  /**
   * **set**
   *
   * Sets a given model to the payload passed in. This is
   * a destructive operation ... any other records of the
   * same type that existed beforehand are removed.
   */
  public static async set<S extends ISdk = ISdk, T extends Model = Model>(
    model: ConstructorFor<T>,
    payload: IDictionary<T>,
    options: IListOptions<S, T> = {}
  ): Promise<List<S, T>> {
    try {
      const r = Record.create(model, options);

      await FireModel.defaultDb.set(
        `${String(r.META.dbOffset)}/${r.pluralName}`,
        addTimestamps(payload)
      );

      const current = await List.all(model, options);
      return current;
    } catch (e) {
      const err = new Error(`Problem adding new Record: ${String(e.message)}`);
      err.name = e.name !== "Error" ? e.name : "FireModel";
      throw e;
    }
  }

  /**
   * Set the default dispatch function
   */
  public static set dispatch(fn: IReduxDispatch) {
    FireModel.dispatch = fn;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static create<T extends Model>(
    model: ConstructorFor<T>,
    options?: IListOptions<ISdk, T>
  ) {
    const defaultSdk = DefaultDbCache().sdk;
    type SDK = typeof defaultSdk extends ISdk ? typeof defaultSdk : ISdk;
    return new List<SDK, T>(model, options);
  }

  /**
   * Creates a List<T> which is populated with the passed in query
   *
   * @param schema the schema type
   * @param query the serialized query; note that this LIST will override the path of the query
   * @param options model options
   */
  public static async fromQuery<S extends ISdk, T extends Model>(
    model: ConstructorFor<T>,
    query: ISerializedQuery<S, T>,
    options: IListOptions<S, T> = {}
  ): Promise<List<ISdk, T>> {
    const list = List.create(model, options);

    const path =
      options && options.offsets
        ? List.dbPath(model, options.offsets)
        : List.dbPath(model);

    query.setPath(path);

    return list._loadQuery(query);
  }

  /**
   * **query**
   *
   * Allow connecting any valid Firebase query to the List object
   */
  public static async query<S extends ISdk, T extends Model>(
    model: ConstructorFor<T>,
    query: IFmQueryDefn<S, T>,
    options: IListQueryOptions<S, T> = {}
  ): Promise<List<S, T>> {
    const db: IDatabaseSdk<S> = options.db || DefaultDbCache().get() as IDatabaseSdk<S>;

    if (!db) {
      throw new FireModelError(
        `Attempt to query database with List before setting a database connection! Either set a default database or explicitly add the DB connection to queries.`,
        "not-allowed"
      );
    }

    const path =
      options && options.offsets
        ? List.dbPath(model, options.offsets)
        : List.dbPath(model);
    const q = SerializedQuery.create<S, T>(db, path);
    const list = List.create(model, options);
    if (options.paginate) {
      list._pageSize = options.paginate;
    }

    const r = await list._loadQuery(query(q)) as unknown as List<S, T>;
    return r;
  }

  /**
   * Loads all the records of a given Model.
   *
   * **Note:** will order results by `lastUpdated` unless
   * an `orderBy` property is passed into the options hash.
   */
  public static async all<S extends ISdk, T extends Model>(
    model: ConstructorFor<T>,
    options: IListOptions<S, T> = {}
  ): Promise<List<S, T>> {
    return List.query<S, T>(
      model,
      (q) => {
        q.orderByChild(options.orderBy || "lastUpdated");
        if (options.limitToFirst) q.limitToFirst(options.limitToFirst);
        if (options.limitToLast) q.limitToLast(options.limitToLast);
        if (options.startAt) q.startAt(options.startAt);
        if (options.endAt) q.endAt(options.endAt);

        return q;
      },
      reduceOptionsForQuery<S, T>(options)
    );
  }

  /**
   * Loads the first X records of the Schema type where
   * ordering is provided by the "createdAt" property
   *
   * @param model the model type
   * @param howMany the number of records to bring back
   * @param options model options
   */
  public static async first<S extends ISdk, T extends Model>(
    model: ConstructorFor<T>,
    howMany: number,
    options: Omit<
      IListOptions<S, T>,
      "limitToFirst" | "limitToLast" | "startAt" | "orderBy"
    > = {}
  ): Promise<List<S, T>> {
    const r = await List.query<S, T>(
      model,
      (q) => {
        q.orderByChild("createdAt").limitToLast(howMany);
        if (options.paginate && options.endAt) {
          console.info(
            `Call to List.first(${capitalize(
              model.constructor.name
            )}, ${howMany}) set the option to paginate AND set a value to 'endAt'. This is typically not done but may be fine.`
          );
        }
        if (options.endAt) q.endAt(options.endAt);

        return q;
      },
      reduceOptionsForQuery<S, T>(options)
    ) as unknown as List<S, T>;

    return r;
  }

  /**
   * recent
   *
   * Get a discrete number of records which represent the most _recently_
   * updated records (uses the `lastUpdated` property on the model).
   */
  public static async recent<S extends ISdk, T extends Model>(
    model: ConstructorFor<T>,
    howMany: number,
    options: Omit<
      IListOptions<S, T>,
      "limitToFirst" | "limitToLast" | "orderBy" | "endAt"
    > = {}
  ): Promise<List<S, T>> {
    return List.query<S, T>(
      model,
      (q) => {
        q.orderByChild("lastUpdated").limitToFirst(howMany);

        if (options.paginate && options.startAt) {
          console.info(
            `Call to List.recent(${capitalize(
              model.constructor.name
            )}, ${howMany}) set the option to paginate AND set a value to 'startAt'. This is typically not done but may be fine.`
          );
        }
        if (options.startAt) q.startAt(options.startAt);

        return q;
      },
      reduceOptionsForQuery<S, T>(options)
    );
  }

  /**
   * **since**
   *
   * Brings back all records that have changed since a given date
   * (using `lastUpdated` field)
   */
  public static async since<S extends ISdk, T extends Model>(
    model: ConstructorFor<T>,
    since: epochWithMilliseconds | datetime | Date,
    options: Omit<IListOptions<S, T>, "startAt" | "endAt" | "orderBy"> = {}
  ): Promise<List<S, T>> {
    switch (typeof since) {
      case "string":
        since = new Date(since).getTime();
        break;
      case "object":
        if (!(since instanceof Date)) {
          throw new FireModelError(
            `Call to List.since(${capitalize(
              model.constructor.name
            )}) failed as the since parameter was of an unrecognized type (an object but not a Date)`,
            "invalid-request"
          );
        }
        since = since.getTime();
        break;
      case "number":
        // nothing to do
        break;
      default:
        throw new FireModelError(
          `Call to List.since(${capitalize(
            model.constructor.name
          )}) failed because the since parameter was of the wrong type [ ${typeof since} ]`,
          "invalid-request"
        );
    }

    return List.query<S, T>(
      model,
      (q) => {
        q.orderByChild("lastUpdated").startAt(since as string | number);
        if (options.limitToFirst) q.startAt(options.limitToFirst);

        return q;
      },
      reduceOptionsForQuery<S, T>(options)
    );
  }

  /**
   * **List.inactive()**
   *
   * provides a way to sort out the "x" _least active_ records where
   * "least active" means that their `lastUpdated` property has gone
   * without any update for the longest.
   */
  public static async inactive<S extends ISdk, T extends Model>(
    model: ConstructorFor<T>,
    howMany: number,
    options: Omit<
      IListOptions<S, T>,
      "limitToLast" | "limitToFirst" | "orderBy"
    > = {}
  ): Promise<List<S, T>> {
    return List.query<S, T>(
      model,
      (q) => {
        q.orderByChild("lastUpdated").limitToLast(howMany);
        if (options.startAt) q.startAt(options.startAt);
        if (options.endAt) q.endAt(options.startAt);

        return q;
      },
      reduceOptionsForQuery<S, T>(options)
    );
  }

  /**
   * **last**
   *
   * Lists the last _x_ items of a given model where "last" refers to the datetime
   * that the record was **created**.
   */
  public static async last<S extends ISdk, T extends Model>(
    model: ConstructorFor<T>,
    howMany: number,
    options: Omit<IListOptions<S, T>, "orderBy"> = {}
  ): Promise<List<S, T>> {
    return List.query<S, T>(
      model,
      (q) => {
        q.orderByChild("createdAt").limitToFirst(howMany);

        if (options.startAt) q.startAt(options.startAt);
        if (options.endAt) q.endAt(options.endAt);

        return q;
      },
      reduceOptionsForQuery<S, T>(options)
    );
  }

  /**
   * **findWhere**
   *
   * Runs a `List.where()` search and returns the first result as a _model_
   * of type `T`. If no results were found it returns `undefined`.
   */
  public static async findWhere<S extends ISdk, T extends Model, K extends keyof T>(
    model: ConstructorFor<T>,
    property: K,
    value: T[K] | [IComparisonOperator, T[K]],
    options: IListOptions<S, T> = {}
  ): Promise<K extends "id" ? T[K] extends string ? Record<ISdk, T> : List<S, T> : List<S, T>> {

    let result: unknown;

    if (property === "id" && isString(value)) {
      const modelName = capitalize(model.constructor.name);
      console.warn(
        `you used List.find(${modelName}, "id", ${String(value)} ) this will be converted to Record.get(${modelName}, ${String(value)}). The List.find() command should be used for properties other than "id"; please make a note of this and change your code accordingly!`
      );
      result = await Record.get(model, value as string) as unknown as Promise<Record<ISdk, T>>;
    } else {
      result = await List.where(model, property as string & keyof T, value, options);
    }

    return result as Promise<K extends "id" ? T[K] extends string ? Record<ISdk, T> : List<S, T> : List<S, T>>;
  }

  /**
   * Puts an array of records into Firemodel as one operation; this operation
   * is only available to those who are using the Admin SDK/API.
   */
  public static async bulkPut<S extends ISdk, T extends Model>(
    model: ConstructorFor<T>,
    records: T[] | IDictionary<T>,
    options: IListOptions<S, T> = {}
  ): Promise<void> {
    if (isClientSdk(DefaultDbCache().get().sdk)) {
      throw new FireModelError(
        `You must use the Admin SDK/API to use the bulkPut feature. This may change in the future but in part because the dispatch functionality is not yet set it is restricted to the Admin API for now.`
      );
    }

    if (Array.isArray(records)) {
      records = arrayToHash<T>(records);
    }

    const dbPath = List.dbPath(model, options.offsets);
    const db = options.db || FireModel.defaultDb;
    await db.update(dbPath, records);
  }

  /**
   * **List.where()**
   *
   * A static inializer which give you a list of all records of a given model
   * which meet a given logical condition. This condition is executed on the
   * **Firebase** side and a `List` -- even if no results met the criteria --
   * is returned.
   *
   * **Note:** the default comparison operator is **equals** but you can
   * override this default by adding a _tuple_ to the `value` where the first
   * array item is the operator, the second the value you are comparing against.
   */
  public static async where<S extends ISdk, T extends Model, K extends keyof T>(
    model: ConstructorFor<T>,
    property: K & string,
    value: T[K] | [IComparisonOperator, T[K]],
    options: Omit<IListOptions<S, T>, "orderBy" | "startAt" | "endAt"> = {}
  ): Promise<List<S, T>> {
    let operation: IComparisonOperator = "=";
    let val = value;
    if (Array.isArray(value)) {
      val = value[1];
      operation = value[0];
    }

    return List.query<S, T>(
      model,
      (q) => {
        q.orderByChild(property);
        q.where(operation, val);

        if (options.limitToFirst) q.limitToFirst(options.limitToFirst);
        if (options.limitToLast) q.limitToLast(options.limitToLast);

        return q;
      },
      reduceOptionsForQuery<S, T>(options)
    );
  }

  /**
   * Get's a _list_ of records. The return object is a `List` but the way it is composed
   * doesn't actually do a query against the database but instead it just takes the array of
   * `id`'s passed in,
   *
   * **Note:** the term `ids` is not entirely accurate, it should probably be phrased as `fks`
   * because the "id" can be any form of `ICompositeKey` as well just a plain `id`. The naming
   * here is just to retain consistency with the **Watch** api.
   *
   * `removed` COMMENT
   */
  public static async ids<T extends Model>(
    model: ConstructorFor<T>,
    ...fks: PrimaryKey<T>[]
  ): Promise<List<ISdk, T>> {
    const promises: Promise<unknown>[] = [];
    const results: T[] = [];
    const errors: Array<{ error: FireModelError; id: PrimaryKey<T> }> = [];
    fks.forEach((id) => {
      promises.push(
        Record.get(model, id)
          .then((p) => results.push(p.data))
          .catch((error) => errors.push({ error, id }))
      );
    });
    await Promise.all(promises);
    // if error resulted from record not existing; this should NOT be seen as
    // an error but all other errors will
    if (errors.length > 0) {
      if (
        errors.every(
          (err) => !err.error.code || err.error.code !== "no-record-found"
        )
      ) {
        const realErrors = errors.filter(
          (err) => !err.error.code || err.error.code !== "no-record-found"
        );
        const emptyResults = errors.filter(
          (err) => err.error.code && err.error.code === "no-record-found"
        );

        const errorOverview = errors
          .map((i) => `[ ${JSON.stringify(i.id)}]: ${i.error.message}`)
          .join("\n");
        if (results.length > 0) {
          throw new FireModelError(
            `While calling List.ids(${capitalize(
              model.name
            )}, ...) all of the ids requested failed. Structured versions of these errors can be found in the "errors" properoty but here is a summary of the error messages recieved:\n\n${errorOverview}`,
            "failure-of-list-ids",
            errors
          );
        }

        throw new FireModelError(
          `While calling List.ids(${capitalize(
            model.name
          )}, ...) there were some successful results but there were error(s) on ${realErrors.length
          } of the ${fks.length} requested records.${emptyResults.length > 0
            ? `There were also ${emptyResults.length} records which came back with empty results (which may be fine). Structured versions of these errors can be found in the "errors" properoty but here is a summary of the error messages recieved:\n\n${errorOverview}`
            : ""
          }`,
          "errors-in-list-ids"
        );
      }
    }

    const obj = new List(model);
    obj._data = results;

    return obj;
  }

  /**
   * If you want to just get the `dbPath` of a Model you can call
   * this static method and the path will be returned.
   *
   * **Note:** the optional second parameter lets you pass in any
   * dynamic path segments if that is needed for the given model.
   */
  public static dbPath<T extends Model>(
    model: ConstructorFor<T>,
    offsets?: Partial<IModel<T>>
  ): string {
    const obj = offsets ? List.create<T>(model, { offsets }) : List.create<T>(model);

    return obj.dbPath;
  }

  protected _offsets: Partial<IModel<T>>;

  //#endregion

  private _data: IModel<T>[] = [];
  private _query: ISerializedQuery<S, T>;
  private _options: IListOptions<S, T>;
  /** the pagination page size; 0 indicates that pagination is not turned on */
  private _pageSize = 0;
  private _page = 0;
  /** flag indicating if all records have now been retrieved */
  private _paginationComplete = false;

  constructor(model: ConstructorFor<T>, options: IListOptions<S, T> = {}) {
    super();
    this._modelConstructor = model;
    this._model = new model();
    this._options = options;
    if (options.db) {
      this._db = options.db;
      if (!FireModel.defaultDb) {
        FireModel.defaultDb = options.db;
      }
    }
    if (options.offsets) {
      this._offsets = options.offsets;
    }
  }

  //#region Getters

  /**
   * The query used in this List instance
   */
  public get query(): ISerializedQuery<S, T> {
    return this._query;
  }

  public get length(): number {
    return this._data.length;
  }

  /** flag indicating whether pagination is being used on this List instance */
  public get usingPagination(): boolean {
    return this._pageSize > 0 ? true : false;
  }

  /**
   * How many "pages" are loaded from Firebase currently.
   */
  public get pagesLoaded(): Readonly<number> {
    return this.usingPagination ? this._page + 1 : undefined;
  }

  public get pageSize(): Readonly<number> {
    return this.usingPagination ? this._pageSize : undefined;
  }

  public get dbPath(): string {
    // const r = Record.create(this._modelConstructor) as IRecord<S, T>;
    return [this._injectDynamicDbOffsets(this.META.dbOffset), this.pluralName].join("/");
  }

  /**
   * Gives the path in the client state tree to the beginning
   * where this LIST will reside.
   *
   * Includes `localPrefix` and `pluralName`, but does not include `localPostfix`
   */
  public get localPath(): string {
    const r = Record.create(this._modelConstructor);
    const meta = r.META;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return pathJoin(
      meta.localPrefix || "",
      meta.localModelName !== this.modelName
        ? meta.localModelName || ""
        : r.pluralName || ""
    );
  }

  /**
   * Used with local state management tools, it provides a postfix to the state tree path
   * The default is `all` and it will probably be used in most cases
   *
   * e.g. If the model is called `Tree` then your records will be stored at `trees/all`
   * (assuming the default `all` postfix)
   */
  public get localPostfix(): string {
    // const r = Record.create(this._modelConstructor);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.META?.localPostfix || "";
  }

  //#endregion Getters

  //#region Public API

  /**
   * Load the next _page_ in a paginated query.
   *
   * This function returns an error if the List object is not setup
   * for pagination.
   */
  public async next(): Promise<void> {
    if (!this.usingPagination) {
      throw new FireModelError(
        `Attempt to call "List.next()" on a list that is _not_ paginated [ ${capitalize(
          this.modelName
        )} ]`
      );
    }

    this._query = queryAdjustForNext(this._query, this._page);
    this._page++;
    const data = (
      await List.query(
        this._modelConstructor,
        () => this._query,
        this._options
      )
    ).data;
    if (data.length < this._pageSize) {
      this._paginationComplete = true;
    }
    this._data = [...this._data, ...data];
  }

  /** Returns another List with data filtered down by passed in filter function */
  public filter(f: (i: IModel<T>) => boolean): List<S, T> {
    const list = List.create(this._modelConstructor) as List<S, T>;
    list._data = this._data.filter(f);
    return list;
  }

  /**
   * provides a `map` function over the records managed by the List; there
   * will be no mutations to the data managed by the list
   */
  public map(f: (i: IModel<T>) => IModel<T>): IModel<T>[] {
    return this.data.map(f);
  }

  /**
   * provides a `forEach` function to iterate over the records managed by the List
   */
  public forEach(f: (i: IModel<T>) => IModel<T>): void {
    this.data.forEach(f);
  }

  /**
   * runs a `reducer` function across all records in the list
   */
  public reduce<R extends unknown>(f: (acc: Partial<R>, i: IModel<T>) => R, initialValue = {} as R): R {
    return this.data.reduce<unknown>(f, initialValue) as R;
  }

  public paginate(pageSize: number): List<S, T> {
    this._pageSize = pageSize;
    return this;
  }

  /**
   * Gives access to the List's array of records
   */
  public get data(): IModel<T>[] {
    return this._data;
  }

  public get pluralName(): string {
    return Record.create(this._modelConstructor).pluralName;
  }

  /**
   * Gets a `Record<T>` from within the list of items.
   *
   * If you just want the Model's data then use `getData` instead.
   */
  public getRecord(id: string): Record<S, T> {

    const found = this.filter((f) => f.id === id);
    if (found.length === 0) {
      throw new FireModelError(
        `Could not find "${id}" in list of ${this.pluralName}`,
        "not-found"
      );
    }

    return Record.createWith(this._modelConstructor, found.data[0]) as Record<S, T>;
  }

  /**
   * Deprecated: use `List.getRecord()`
   */
  public findById(id: string): Record<S, T> {
    console.warn("List.findById() is deprecated. Use List.get() instead.");
    return this.getRecord(id);
  }

  /**
   * Allows for records managed by this **List** to be removed from the
   * database.
   */
  public async remove(id: string, ignoreOnNotFound = false): Promise<void> {
    try {
      const rec = this.getRecord(id);
      await rec.remove();
      this._data = this.filter((f) => f.id !== id).data;
    } catch (e) {
      if (!ignoreOnNotFound && e.code === "not-found") {
        throw new FireModelError(
          `Could not remove "${id}" in the supplied List of "${capitalize(
            this.pluralName
          )}" as the ID did not exist!`,
          `firemodel/not-allowed`
        );
      } else {
        throw e;
      }
    }
  }

  /** deprecated ... use List.remove() instead */
  public async removeById(id: string, ignoreOnNotFound = false): Promise<void> {
    console.log(`List.removeById() is deprecated; use List.remove() instead`);
    return this.remove(id, ignoreOnNotFound);
  }

  public async add(payload: T): Promise<Record<S, T>> {
    const newRecord = await Record.add(this._modelConstructor, payload) as Record<S, T>;
    this._data.push(newRecord.data);
    return newRecord;
  }

  /**
   * Gets the data from a given record; return _undefined_ if not found
   */
  public get(id: string): IModel<T> {
    return this.data.find((i) => i.id === id);
  }

  /** Deprecated: use `List.get()` instead */
  public getData(id: string): IModel<T> {
    console.log("List.getData() is deprecated; use List.get()");
    return this.get(id);
  }

  /**
   * Loads data from a query into the `List` object
   */
  protected async _loadQuery(query: ISerializedQuery<S, T>): Promise<this> {
    if (!this.db) {
      const e = new Error(
        `The attempt to load data into a List requires that the DB property be initialized first!`
      );
      e.name = "NoDatabase";
      throw e;
    }

    this._query = query;
    this._data = await this.db.getList<T>(query);
    return this;
  }

  //#endregion Public API

  private _injectDynamicDbOffsets(dbOffset: string) {
    if (dbOffset.indexOf(":") === -1) {
      return dbOffset;
    }

    const dynamicPathProps = Record.dynamicPathProperties(
      this._modelConstructor
    );

    keys(this._offsets || {}).forEach((prop: keyof IModel<T> & string) => {
      if (dynamicPathProps.includes(prop)) {
        const value = this._offsets[prop];
        if (!["string", "number"].includes(typeof value)) {
          throw new FireModelError(
            `The dynamic dbOffset is using the property "${prop}" on ${this.modelName
            } as a part of the route path but that property must be either a string or a number and instead was a ${typeof value}`,
            "record/not-allowed"
          );
        }
        dbOffset = dbOffset.replace(`:${prop}`, String(value));
      }
    });

    if (dbOffset.includes(":")) {
      throw new FireModelError(
        `Attempt to get the dbPath of a List where the underlying model [ ${capitalize(
          this.modelName
        )} ] has dynamic path segments which were NOT supplied! The offsets provided were "${JSON.stringify(
          Object.keys(this._offsets || {})
        )}" but this leaves the following uncompleted dbOffset: ${dbOffset}`
      );
    }

    return dbOffset;
  }
}
