/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
//#region imports
import { DefaultDbCache, FireModel, List } from "~/core";
import {
  FireModelError,
  FireModelProxyError,
  NotHasManyRelationship,
  NotHasOneRelationship,
  RecordCrudFailure,
} from "~/errors";
import {
  FmEvents,
  ICompositeKey,
  ForeignKey,
  IFmCrudOperations,
  IFmDispatchOptions,
  IFmLocalRecordEvent,
  IFmPathValuePair,
  IFmRelationshipOptions,
  IFmRelationshipOptionsForHasMany,
  IRecordOptions,
  IRecordRelationshipMeta,
  IReduxDispatch,
  IWatcherEventContext,
  IWriteOperation,
  PropertyOf,
  PrimaryKey,
  isCompositeString,
  IFmModelPropertyMeta,
  IFmModelRelationshipMeta,
  IModel,
  ModelInput,
  IFmLocalEvent,
} from "~/types";
import { IDictionary, Nullable, Omit, fk, ConstructorFor } from "common-types";
import { entries } from "inferred-types";
import { WatchDispatcher, findWatchers } from "./watchers";
import {
  buildDeepRelationshipLinks,
  buildRelationshipPaths,
  createCompositeKeyFromRecord,
  createCompositeKey,
  relationshipOperation,
  createCompositeKeyString,
} from "./records";
import {
  capitalize,
  compareHashes,
  getModelMeta,
  isHasManyRelationship,
  withoutMetaOrPrivate,
} from "~/util";

import { keys, pathJoin, pluralize } from "native-dash";

import { UnwatchedLocalEvent } from "~/state-mgmt";
import { default as copy } from "fast-copy";
import { key as fbKey } from "firebase-key";
import { IDatabaseSdk, ISdk } from "@forest-fire/types";
import { Model } from "~/models/Model";

//#endregion

export class Record<
  T extends Model,
  S extends ISdk = "RealTimeClient"
> extends FireModel<S, T> {
  //#region STATIC INTERFACE
  public static set defaultDb(db: IDatabaseSdk<ISdk>) {
    DefaultDbCache().set<IDatabaseSdk<typeof db.sdk>>(db);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static get defaultDb() {
    const db = DefaultDbCache().get();
    return db as unknown as IDatabaseSdk<typeof db.sdk>;
  }

  public static set dispatch(fn: IReduxDispatch) {
    FireModel.dispatch = fn;
  }

  /**
   * **dynamicPathProperties**
   *
   * An array of "dynamic properties" that are derived fom the "dbOffset" to
   * produce the "dbPath". Note: this does NOT include the `id` property.
   */
  public static dynamicPathProperties<T extends Model = Model>(
    /**
     * the **Model** who's properties are being interogated
     */
    model: new () => T
  ) {
    return Record.create(model).dynamicPathComponents;
  }

  /**
   * create
   *
   * creates a new -- and empty -- Record object; often used in
   * conjunction with the Record's initialize() method
   */
  public static create<T extends Model, S extends ISdk = "RealTimeClient">(
    model: new () => T,
    options: IRecordOptions<S> = {}
  ) {
    // const defaultSdk = DefaultDbCache().sdk;
    const r = new Record<T, S>(model, options);
    if (options.silent && !r.db.isMockDb) {
      throw new FireModelError(
        `You can only add new records to the DB silently when using a Mock database!`,
        "forbidden"
      );
    }

    return r;
  }

  /**
   * Creates an empty record and then inserts all values
   * provided along with default values provided in META.
   */
  public static local<T extends Model, O extends IRecordOptions<ISdk>>(
    model: new () => T,
    values: ModelInput<T>,
    options: O & { ignoreEmptyValues?: boolean } = {} as O
  ) {
    const rec = Record.create(model, options as O);
    if (
      !options.ignoreEmptyValues &&
      (!values || Object.keys(values).length === 0)
    ) {
      throw new FireModelError(
        "You used the static Record.local() method but passed nothing into the 'values' property! If you just want to skip this error then you can set the options to { ignoreEmptyValues: true } or just use the Record.create() method.",
        `firemodel/record::local`
      );
    }

    if (values) {
      const defaultValues = rec.META.properties.filter(
        (i) => i.defaultValue !== undefined
      );

      // also include "default values"
      defaultValues.forEach((i: IFmModelPropertyMeta<T>["defaultValue"]) => {
        if (rec.get(i.property) === undefined) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          rec.set(i.property, i.defaultValue, true);
        }
      });
    }

    return rec;
  }

  /**
   * add
   *
   * Adds a new record to the database
   *
   * @param schema the schema of the record
   * @param payload the data for the new record; this optionally can include the "id" but if left off the new record will use a firebase pushkey
   * @param options
   */
  public static async add<
    T extends Model,
    O extends IRecordOptions<S>,
    S extends ISdk = "RealTimeClient"
  >(model: (new () => T) | string, payload: IModel<T>, options: O = {} as O) {
    // const defaultSdk = DefaultDbCache().sdk;
    let r: Record<T, S>;
    if (typeof model === "string") {
      model = FireModel.lookupModel(model);
    }
    try {
      if (!model) {
        throw new FireModelError(
          `The model passed into the Record.add() static initializer was not defined! This is often the result of a circular dependency. Note that the "payload" sent into Record.add() was:\n\n${JSON.stringify(
            payload,
            null,
            2
          )}`
        );
      }
      r = Record.createWith<T, S>(model, payload as Partial<T>, options);

      if (!payload.id) {
        const path = List.dbPath<Model<T>>(model, payload);
        payload.id = await r.db.getPushKey(path);
      }

      await r._initialize(payload, options);
      const defaultValues = r.META.properties.filter(
        (i) => i.defaultValue !== undefined
      );
      defaultValues.forEach((i: IFmModelPropertyMeta<T>) => {
        if (r.get(i.property) === undefined) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          r.set(i.property, i.defaultValue, true);
        }
      });

      await r._adding(options);
    } catch (e) {
      if (e.code === "permission-denied") {
        const rec = Record.createWith(model, payload as Partial<T>);
        throw new FireModelError(
          `Permission error while trying to add the ${capitalize(
            rec.modelName
          )} to the database path ${rec.dbPath}`,
          "firemodel/permission-denied"
        );
      }

      if (e.name.includes("firemodel")) {
        throw e;
      }

      throw new FireModelProxyError(e, "Failed to add new record ");
    }

    return r;
  }

  /**
   * **update**
   *
   * update an existing record in the database with a dictionary of prop/value pairs
   *
   * @param model the _model_ type being updated
   * @param pk the `id` for the model being updated
   * @param updates properties to update; this is a non-destructive operation so properties not expressed will remain unchanged. Also, because values are _nullable_ you can set a property to `null` to REMOVE it from the database.
   * @param options
   */
  public static async update<
    T extends Model,
    O extends IRecordOptions<S>,
    S extends ISdk = "RealTimeClient"
  >(
    model: new () => T,
    pk: PrimaryKey<T>,
    updates: Nullable<Partial<IModel<T>>>,
    options: O = {} as O
  ) {
    let r;
    try {
      r = await Record.get<T, IRecordOptions<S>, S>(model, pk, options);
      await r.update(updates);
    } catch (e) {
      const err = new Error(
        `Problem adding new Record: ${(e as Error).message}`
      );
      err.name = e.name !== "Error" ? e.name : "FireModel";
      throw e;
    }

    return r;
  }

  /**
   * Pushes a new item into a property that is setup as a "pushKey"
   *
   * @param model the model being operated on
   * @param pk  an `id` or `CompositeKey` that uniquely identifies a record
   * @param property the property on the record
   * @param payload the new payload you want to push into the array
   */
  public static async pushKey<
    T extends Model,
    K extends PropertyOf<T>,
    S extends ISdk = "RealTimeClient"
  >(
    model: new () => T,
    pk: PrimaryKey<T>,
    property: K,
    payload: T[K][keyof T[K]],
    options: IRecordOptions<S> = {}
  ) {
    const obj = await Record.get<T, IRecordOptions<S>, S>(model, pk, options);
    return obj.pushKey(property, payload);
  }

  /**
   * **createWith**
   *
   * A static initializer that creates a Record of a given class
   * and then initializes the state with either a Model payload
   * or a CompositeKeyString (aka, '[id]::[prop]:[value]').
   *
   * You should be careful in using this initializer; the expected
   * _intents_ include:
   *
   * 1. to initialize an in-memory record of something which is already
   * in the DB
   * 2. to get all the "composite key" attributes into the record so
   * all META queries are possible
   *
   * If you want to add this record to the database then use `add()`
   * initializer instead.
   *
   * @prop model a constructor for the underlying model
   * @payload either a string representing an `id` or Composite Key or alternatively
   * a hash/dictionary of attributes that are to be set as a starting point
   */
  public static createWith<T extends Model, S extends ISdk = "RealTimeClient">(
    model: ConstructorFor<T>,
    payload: PrimaryKey<T> | Partial<IModel<T>>,
    options: IRecordOptions<S> = {}
  ): Record<T, S> {
    const rec = Record.create(model, options);

    if (options.setDeepRelationships === true) {
      throw new FireModelError(
        `Trying to create a ${capitalize(
          rec.modelName
        )} with the "setDeepRelationships" property set. This is NOT allowed; consider the 'Record.add()' method instead.`,
        "not-allowed"
      );
    }

    const properties =
      typeof payload === "string"
        ? createCompositeKey(payload, rec.modelConstructor)
        : payload;
    // TODO: build some tests to ensure that ...
    // the async possibilites of this method (only if `options.setDeepRelationships`)
    // are not negatively impacting this method
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    rec._initialize(properties, options);
    if (!FireModel.defaultDb) {
      FireModel.defaultDb = options.db;
    }
    return rec;
  }

  /**
   * get (static initializer)
   *
   * Allows the retrieval of records based on the record's id (and dynamic path prefixes
   * in cases where that applies)
   *
   * @param model the model definition you are retrieving
   * @param id either just an "id" string or in the case of models with dynamic path prefixes you can pass in an object with the id and all dynamic prefixes
   * @param options
   */
  public static async get<
    T extends Model,
    O extends IRecordOptions<S>,
    S extends ISdk = "RealTimeClient"
  >(
    model: new () => T,
    pk: PrimaryKey<T>,
    options: O = {} as O
  ): Promise<Record<T, S>> {
    const record = Record.create<T, S>(model, options);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (record as any)._getFromDatabase(pk);
    return record;
  }

  public static async remove<
    T extends Model,
    S extends ISdk = "RealTimeClient"
  >(
    model: new () => T,
    pk: PrimaryKey<T>,
    /** if there is a known current state of this model you can avoid a DB call to get it */
    currentState?: Record<T, S>
  ) {
    // TODO: add lookup in local state to see if we can avoid DB call
    const record = currentState
      ? currentState
      : await Record.get<T, IRecordOptions<S>, S>(model, pk);
    await record.remove();
    return record;
  }

  //#region STATIC: Relationships

  /**
   * Associates a new FK to a relationship on the given `Model`; returning
   * the primary model as a return value
   *
   * @param model The `Model` which the association will originate from
   * @param pk the _primary key_ of the primary model above
   * @param property the _property_ on the primary model which relates to another model(s)
   * @param refs one or more FK references
   */
  public static async associate<
    T extends Model,
    S extends ISdk = "RealTimeClient"
  >(
    model: ConstructorFor<T>,
    pk: PrimaryKey<T>,
    property: PropertyOf<T>,
    refs: ForeignKey | ForeignKey[],
    options: IFmRelationshipOptions<S> = {}
  ) {
    const obj: Record<T, S> = await Record.get<T, IRecordOptions<S>, S>(
      model,
      pk
    );
    await obj.associate(property, refs, options);
    return obj;
  }

  /**
   * Given a database _path_ and a `Model`, pull out the composite key from
   * the path. This works for Models that do and _do not_ have dynamic segments
   * and in both cases the `id` property will be returned as part of the composite
   * so long as the path does indeed have the `id` at the end of the path.
   */
  public static getCompositeKeyFromPath<T extends Model>(
    model: new () => T,
    path: string
  ) {
    if (!path) {
      return {};
    }

    const r = Record.create(model);
    const pathParts = path.replace(/\//gs, ".").split(".");

    const compositeKey: IDictionary = {};
    const segments = r.dbOffset.replace(/\//gs, ".").split(".");
    if (
      segments.length > pathParts.length ||
      pathParts.length - 2 > segments.length
    ) {
      throw new FireModelError(
        `Attempt to get the composite key from a path failed due to the diparity of segments in the path [ ${
          pathParts.length
        } ] versus the dynamic path [ ${String(segments.length)} ]`,
        "firemodel/not-allowed"
      );
    }

    // TODO: come back and replace "any" with better typing
    segments.forEach((segment: string, idx: number) => {
      if (segment.slice(0, 1) === ":") {
        const name = segment.slice(1);
        const value = pathParts[idx];
        compositeKey[name] = value;
      } else {
        if (segment !== pathParts[idx]) {
          throw new FireModelError(
            `The attempt to build a composite key for the model ${capitalize(
              r.modelName
            )} failed because the static parts of the path did not match up. Specifically where the "dbOffset" states the segment "${JSON.stringify(
              segment
            )}" the path passed in had "${pathParts[idx]}" instead.`
          );
        }
      }
      if (pathParts.length - 1 === segments.length) {
        compositeKey.id = pathParts.slice(-1);
      }
    });

    return compositeKey;
  }

  /**
   * Given a Model and a partial representation of that model, this will generate
   * a composite key (in _object_ form) that conforms to the `ICompositeKey` interface
   * and uniquely identifies the given record.
   *
   * @param model the class definition of the model you want the CompositeKey for
   * @param object the data which will be used to generate the Composite key from
   */
  public static compositeKey<T extends Model>(
    model: ConstructorFor<T>,
    obj: Partial<IModel<T>>
  ): ICompositeKey<T> {
    // this will validate the `obj` to ensure proper properties are present
    // while at the same time allowing extraneous props to pass through
    return createCompositeKey(obj as ICompositeKey<T>, model, true);
  }

  /**
   * Given a Model and a partial representation of that model, this will generate
   * a composite key in _string_ form that conforms to the `IPrimaryKey` interface
   * and uniquely identifies the given record.
   *
   * @param model the class definition of the model you want the CompositeKey for
   * @param object the data which will be used to generate the Composite key from
   */
  public static compositeKeyRef<T extends Model>(
    model: new () => T,
    /** either a partial model or just the `id` of the model if model is not a dynamic path */
    object: Partial<T> | string
  ): string {
    if (Record.dynamicPathProperties(model).length === 0) {
      return typeof object === "string" ? object : object.id;
    }

    if (typeof object === "string") {
      if (isCompositeString(object)) {
        // Forward strings which already appear to be composite key reference
        return object;
      } else {
        throw new FireModelError(
          `Attempt to get a compositeKeyRef() but passed in a string/id value instead of a composite key for a model [ ${Record.modelName(
            model
          )}, "${object}" ] which HAS dynamic properties! Required props are: ${Record.dynamicPathProperties(
            model
          ).join(", ")}`,
          "not-allowed"
        );
      }
    }
    const compositeKey = Record.compositeKey(model, object);
    const nonIdKeys: { prop: PropertyOf<T>; value: unknown }[] = Object.keys(
      compositeKey
    ).reduce(
      (agg, prop: keyof typeof compositeKey & string) =>
        prop === "id" ? agg : agg.concat({ prop, value: compositeKey[prop] }),
      []
    );

    return `${compositeKey.id}::${nonIdKeys
      .map((tuple) => `${tuple.prop}:${String(tuple.value)}`)
      .join("::")}`;
  }

  /**
   * Returns the name of the name of the `Model`.
   *
   * Note: it returns the name in PascalCase _not_
   * camelCase.
   */
  public static modelName<T extends Model>(model: new () => T) {
    const r = Record.create(model);
    return capitalize(r.modelName);
  }

  //#endregion STATIC: Relationships

  //#endregion

  //#region INSTANCE DEFINITION
  private _existsOnDB = false;
  private _writeOperations: IWriteOperation[] = [];
  private _data: IModel<T>;
  public readonly kind: "record";

  constructor(model: new () => T, protected options: IRecordOptions<S> = {}) {
    super();

    this._modelConstructor = model;
    this._model = new model();
    this._data = new model();
  }

  public get data(): Readonly<T> {
    return this._data as Readonly<T>;
  }

  /**
   * The plural name of the model
   */
  public get pluralName(): string {
    return this.META.plural || pluralize(this.modelName);
  }

  public get properties(): IFmModelPropertyMeta<T>[] {
    return this.META.properties as unknown as IFmModelPropertyMeta<T>[];
  }

  public get relationships(): IFmModelRelationshipMeta<T>[] {
    return this.META.relationships as unknown as IFmModelRelationshipMeta<T>[];
  }

  /**
   * @deprecated
   */
  public get isDirty(): boolean {
    throw new FireModelError(
      "Call to isDirty() should be avoided; this functionality is deprecated",
      "firemodel/invalid"
    );
  }

  /**
   * @deprecated
   */
  public set isDirty(value: boolean) {
    throw new FireModelError(
      "Call to isDirty() should be avoided; this functionality is deprecated",
      "firemodel/invalid"
    );
  }

  /**
   * returns the fully qualified name in the database to this record;
   * this of course includes the record id so if that's not set yet calling
   * this getter will result in an error
   */
  public get dbPath(): string {
    if (this.data.id ? false : true) {
      throw new FireModelError(
        `you can not ask for the dbPath before setting an "id" property [ ${this.modelName} ]`,
        "record/not-ready"
      );
    }

    return [
      this._injectDynamicPathProperties(this.dbOffset),
      this.pluralName,
      this.data.id,
    ].join("/");
  }

  /**
   * provides a boolean flag which indicates whether the underlying
   * model has a "dynamic path" which ultimately comes from a dynamic
   * component in the "dbOffset" property defined in the model decorator
   */
  public get hasDynamicPath(): boolean {
    return this.META.dbOffset.includes(":");
  }

  /**
   * **dynamicPathComponents**
   *
   * An array of "dynamic properties" that are derived fom the "dbOffset" to
   * produce the "dbPath"
   */
  public get dynamicPathComponents(): PropertyOf<T>[] {
    return this._findDynamicComponents(this.META.dbOffset);
  }

  /**
   * the list of dynamic properties in the "localPrefix"
   * which must be resolved to achieve the "localPath"
   */
  public get localDynamicComponents(): PropertyOf<T>[] {
    return this._findDynamicComponents(this.META.localPrefix);
  }

  /**
   * A hash of values -- including at least "id" -- which represent
   * the composite key of a model.
   */
  public get compositeKey(): ICompositeKey<T> {
    return createCompositeKeyFromRecord<T, S>(this);
  }

  /**
   * a string value which is used in relationships to fully qualify
   * a composite string (aka, a model which has a dynamic dbOffset)
   */
  public get compositeKeyRef() {
    return createCompositeKeyString(this.compositeKey);
  }

  /**
   * The Record's primary key; this is the `id` property only. Not
   * the composite key.
   */
  public get id(): string {
    return this.data.id;
  }

  /**
   * Allows setting the Record's `id` if it hasn't been set before.
   * Resetting the `id` is not allowed.
   */
  public set id(val: string) {
    if (this.data.id) {
      throw new FireModelError(
        `You may not re-set the ID of a record [ ${this.modelName}.id ${this.data.id} => ${val} ].`,
        "firemodel/not-allowed"
      );
    }

    this._data.id = val;
  }

  /**
   * Returns the record's database _offset_ without the ID or any dynamic properties
   * yet interjected. The _dynamic properties_ however, will be show with a `:` prefix
   * to indicate where the the values will go.
   */
  public get dbOffset() {
    // return getModelMeta(this as Record<S, T>).dbOffset;
    return this.META.dbOffset;
  }

  /**
   * returns the record's location in the frontend state management framework;
   * this can include dynamic properties characterized in the path string by
   * leading ":" character.
   */
  public get localPath() {
    let prefix = this.localPrefix;
    this.localDynamicComponents.forEach((prop) => {
      prefix = prefix.replace(`:${prop}`, String(this.get(prop)));
    });
    return pathJoin(
      prefix,
      this.META.localModelName !== this.modelName
        ? this.META.localModelName
        : this.options.pluralizeLocalPath
        ? this.pluralName
        : this.modelName
    );
  }

  /**
   * The path in the local state tree that brings you to
   * the record; this is differnt when retrieved from a
   * Record versus a List.
   */
  public get localPrefix() {
    // return getModelMeta(this).localPrefix;
    return this.META.localPrefix;
  }

  public get existsOnDB() {
    return this.data && this.data.id ? true : false;
  }

  public get modelConstructor() {
    return this._modelConstructor;
  }

  /**
   * Returns a `Record` for the FK of the given model, assuming that the
   * relationship has a cardinality of 1 (aka, hasOne/ownedBy).
   *
   * If instead, you want to get ALL the `Record`'s relationing to a relationship
   * of a cardinality greater than 1 than you should use `getRecordsForRelationship`
   * instead.
   *
   * @param property the relationship _property name_ which has has a
   * FK relationship to another model
   */
  public getMetaForRelationship(
    property: string & keyof IModel<T>
  ): IRecordRelationshipMeta {
    if (!this.META.property(property)?.isRelationship) {
      throw new FireModelError(
        `Attempt to get a Record instance for a relationship contained on the "${capitalize(
          this.modelName
        )}" model failed. The property "${property}" is either not a property or is not a relationship property on this model!`,
        "invalid-relationship-lookup"
      );
    }
    if (this.META.property(property).relType === "hasMany") {
      throw new FireModelError(
        `Attempt to get a Record instance for a a relationship contained on the "${capitalize(
          this.modelName
        )}" model failed because the relationship property ["${property}"] has a cardinality greater than 1. Use "getRecordsForRelationships" instead.`
      );
    }
    const pkHasInverse = this.META.relationship(property).inverseProperty;
    const fkInverseProperty = this.META.relationship(property).inverseProperty;
    const fkRec = Record.create(this.META.property(property).fkConstructor());
    const inverseIsMissing = pkHasInverse
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fkRec.META.relationship(fkInverseProperty as any).inverseProperty ===
        property
      : false;

    const pkCardinality =
      this.META.relationship(property).relType === `hasMany` ? "M" : "1";
    const fkCardinality =
      pkHasInverse &&
      fkRec.META.relationship(fkInverseProperty).relType === `hasMany`
        ? "M"
        : "1";
    const cardinality = `${pkCardinality}:${fkCardinality}`;
    const inversePointsToWrongModel = pkHasInverse
      ? fkRec.META.relationship(fkInverseProperty).fkModelName !==
        this.modelName
      : false;
    const fkReciprocalInverseProperty =
      pkHasInverse && fkRec.META.relationship(property).hasInverse
        ? fkRec.META.relationship(property).inverseProperty
        : undefined;
    const fkHasInvalidInverse =
      pkHasInverse &&
      fkRec.META.relationship(property).hasInverse &&
      fkRec.META.relationship(property).inverseProperty !== property
        ? true
        : false;

    return {
      fkConstructor: this.META.property(property).fkConstructor,
      modelName: fkRec.modelName,
      pluralName: fkRec.pluralName,
      inverseIsMissing,
      inversePointsToWrongModel,
      fkHasInvalidInverse,
      fkInverseProperty,
      fkReciprocalInverseProperty,
      cardinality,
    };
  }

  /**
   * Goes out to the database and reloads this record
   */
  public async reload() {
    const reloaded = await Record.get(
      this._modelConstructor,
      this.compositeKeyRef
    );
    return reloaded;
  }

  /**
   * addAnother
   *
   * Allows a simple way to add another record to the database
   * without needing the model's constructor fuction. Note, that
   * the payload of the existing record is ignored in the creation
   * of the new.
   *
   * @param payload the payload of the new record
   */
  public async addAnother(payload: T, options: IRecordOptions<S> = {}) {
    const newRecord = await Record.add<T, IRecordOptions<S>, S>(
      this._modelConstructor,
      payload,
      options
    );
    return newRecord;
  }

  public isSameModelAs<M extends IModel<M>>(model: new () => M): boolean {
    return this._modelConstructor.name === model.name;
  }

  /**
   * Pushes new values onto properties on the record
   * which have been stated to be a "pushKey"
   */
  public async pushKey<K extends keyof IModel<T> & string>(
    property: K,
    value: T[K][keyof T[K]] | unknown
  ): Promise<fk> {
    if (this.META.pushKeys.indexOf(property) === -1) {
      throw new FireModelError(
        `Invalid Operation: you can not push to property "${property}" as it has not been declared a pushKey property in the schema`,
        "invalid-operation/not-pushkey"
      );
    }

    if (!this.existsOnDB) {
      throw new FireModelError(
        `Invalid Operation: you can not push to property "${property}" before saving the record to the database`,
        "invalid-operation/not-on-db"
      );
    }
    const key = this.db.isMockDb
      ? fbKey()
      : await this.db.getPushKey(pathJoin(this.dbPath, property));

    await this.db.update(pathJoin(this.dbPath, property), {
      [pathJoin(this.dbPath, property, key)]: value,
      [pathJoin(this.dbPath, "lastUpdated")]: new Date().getTime(),
    });

    // set firemodel state locally
    const currentState = this.get(property) || {};
    const newState = { ...(currentState as T[K]), [key]: value };
    await this.set(property, newState);

    return key;
  }

  /**
   * **update**
   *
   * Updates a set of properties on a given model atomically (aka, all at once);
   * will automatically include the "lastUpdated" property. Does NOT
   * allow relationships to be included, this should be done separately.
   *
   * If you want to remove a particular property but otherwise leave the object
   * unchanged, you can set that values(s) to NULL and it will be removed without
   * impact to other properties.
   *
   * @param props a hash of name value pairs which represent the props being
   * updated and their new values
   */
  public async update(props: Nullable<Partial<IModel<T>>>) {
    // const meta = getModelMeta(this);
    const meta = this.META;
    if (!meta.property) {
      throw new FireModelError(
        `There is a problem with this record's META information [ model: ${capitalize(
          this.modelName
        )}, id: ${
          this.id
        } ]. The property() method -- used to dig into properties on any given model appears to be missing!`,
        "firemodel/meta-missing"
      );
    }

    // can not update relationship properties
    if (
      keys(props).some((key) => {
        const root = (key as string).split(".")[0];
        const rootProperties = meta.property(root as keyof IModel<T> & string);
        if (!rootProperties) {
          throw new FireModelError(
            `While this record [ model: ${capitalize(this.modelName)}, id: ${
              this.id
            } ] does return a "META.property" function, looking up the property "${root}" has resulted in an invalid response [${typeof rootProperties}]`
          );
        }
        return rootProperties.isRelationship;
      })
    ) {
      const relProps = keys(props).filter(
        (p: keyof IModel<T> & string) => meta.property(p).isRelationship
      );
      throw new FireModelError(
        `You called update on a hash which has relationships included in it. Please only use "update" for updating properties. The relationships you were attempting to update were: ${relProps.join(
          ", "
        )}.`,
        `firemodel/not-allowed`
      );
    }

    const lastUpdated = new Date().getTime();
    const changed = {
      ...props,
      lastUpdated,
    };
    const rollback = copy(this.data);
    // changes local Record to include updates immediately
    this._data = { ...this.data, ...changed };

    // performs a two phase commit using dispatch messages
    await this._localCrudOperation(IFmCrudOperations.update, rollback);

    return;
  }

  /**
   * **remove**
   *
   * Removes the active record from the database and dispatches the change to
   * FE State Mgmt.
   */
  public async remove() {
    await this._localCrudOperation(IFmCrudOperations.remove, copy(this.data));
  }

  /**
   * Changes the local state of a property on the record
   *
   * @param prop the property on the record to be changed
   * @param value the new value to set to
   * @param silent a flag to indicate whether the change to the prop should be updated
   * to the database or not
   */
  public async set<K extends PropertyOf<T> | "lastUpdated" | "createdAt">(
    prop: K,
    value: T[K],
    silent = false
  ) {
    const rollback = copy(this.data);
    const meta = this.META.property(prop as PropertyOf<T>);
    if (!meta) {
      throw new FireModelError(
        `There was a problem getting the meta data for the model ${capitalize(
          this.modelName
        )} while attempting to set the "${prop}" property to: ${JSON.stringify(
          value
        )}`
      );
    }
    if (meta.isRelationship) {
      throw new FireModelError(
        `You can not "set" the property "${prop}" because it is configured as a relationship!`,
        "firemodel/not-allowed"
      );
    }
    const lastUpdated = new Date().getTime();
    const changed = {
      [prop]: value,
      lastUpdated,
    };
    // locally change Record values
    this._data = { ...this._data, ...changed };
    // dispatch
    if (!silent) {
      await this._localCrudOperation(IFmCrudOperations.update, rollback, {
        silent,
      });
    }

    return;
  }

  /**
   * **associate**
   *
   * Associates the current model with another entity
   * regardless if the cardinality
   */
  public async associate(
    property: PropertyOf<T>,
    refs: ForeignKey | ForeignKey[],
    options: IFmRelationshipOptions<S> = {}
  ) {
    // const meta = getModelMeta(this);
    const meta = this.META;
    if (!meta.relationship(property)) {
      throw new FireModelError(
        `Attempt to associate the property "${property}" can not be done on model ${capitalize(
          this.modelName
        )} because the property is not defined!`,
        `firemodel/not-allowed`
      );
    }
    if (!meta.relationship(property).relType) {
      throw new FireModelError(
        `For some reason the property "${property}" on the model ${capitalize(
          this.modelName
        )} doesn't have cardinality assigned to the "relType" (aka, hasMany, hasOne).\n\nThe META for relationships on the model are: ${JSON.stringify(
          meta.relationships,
          null,
          2
        )}`,
        `firemodel/unknown`
      );
    }
    const relType = meta.relationship(property).relType;
    if (relType === "hasMany") {
      await this.addToRelationship(property, refs, options);
    } else {
      if (Array.isArray(refs)) {
        if (refs.length === 1) {
          refs = refs.pop();
        } else {
          throw new FireModelError(
            `Attempt to use "associate()" with a "hasOne" relationship [ ${property}] on the model ${capitalize(
              this.modelName
            )}.`,
            "firemodel/invalid-cardinality"
          );
        }
      }
      await this.setRelationship(property, refs, options);
    }
  }

  /**
   * **disassociate**
   *
   * Removes an association between the current model and another entity
   * (regardless of the cardinality in the relationship)
   */
  public async disassociate(
    property: keyof IModel<T> & string,
    // TODO: ideally stronger typing below
    refs: ForeignKey | ForeignKey[],
    options: IFmRelationshipOptions<S> = {}
  ) {
    const relType = this.META.relationship(property).relType;
    if (relType === "hasMany") {
      await this.removeFromRelationship(property, refs, options);
    } else {
      await this.clearRelationship(property, options);
    }
  }

  /**
   * Adds one or more fk's to a hasMany relationship.
   *
   * Every relationship will be added as a "single transaction", meaning that ALL
   * or NONE of the relationshiop transactions will succeed. If you want to
   * take a more optimistic approach that accepts each relationship pairing (PK/FK)
   * then you should manage the iteration outside of this call and let this call
   * only manage the invidual PK/FK transactions (which should ALWAYS be atomic).
   *
   * @param property the property which is acting as a foreign key (array)
   * @param fkRefs FK reference (or array of FKs) that should be added to reln
   * @param options change the behavior of this relationship transaction
   */
  public async addToRelationship(
    property: PropertyOf<T>,
    fkRefs: ForeignKey | ForeignKey[],
    options: IFmRelationshipOptionsForHasMany<S> = {}
  ): Promise<void> {
    const altHasManyValue = options.altHasManyValue || true;

    if (!isHasManyRelationship<S, T>(this, property)) {
      throw new NotHasManyRelationship<S, T>(
        this,
        property,
        "addToRelationship"
      );
    }

    fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
    let paths: IFmPathValuePair[] = [];

    const now = new Date().getTime();
    fkRefs.map((ref: ForeignKey<T>) => {
      paths = [
        ...buildRelationshipPaths<T, S>(this, property, ref, {
          now,
          altHasManyValue,
        }),
        ...paths,
      ];
    });

    await relationshipOperation(this, "add", property, fkRefs, paths, options);
  }

  /**
   * removeFromRelationship
   *
   * remove one or more FK's from a `hasMany` relationship
   *
   * @param property the property which is acting as a FK
   * @param fkRefs the FK's on the property which should be removed
   */
  public async removeFromRelationship(
    property: PropertyOf<T>,
    fkRefs: ForeignKey | ForeignKey[],
    options: IFmRelationshipOptionsForHasMany<S> = {}
  ): Promise<void> {
    if (!isHasManyRelationship(this, property)) {
      throw new NotHasManyRelationship(
        this,
        property,
        "removeFromRelationship"
      );
    }

    fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
    let paths: IFmPathValuePair[] = [];

    const now = new Date().getTime();
    fkRefs.map((ref: ForeignKey<T>) => {
      paths = [
        ...buildRelationshipPaths(this, property, ref, {
          now,
          operation: "remove",
        }),
        ...paths,
      ];
    });

    await relationshipOperation(
      this,
      "remove",
      property,
      fkRefs,
      paths,
      options
    );
  }

  /**
   * **clearRelationship**
   *
   * clears an existing FK on a `hasOne` relationship or _all_ FK's on a
   * `hasMany` relationship
   *
   * @param property the property containing the relationship to an external
   * entity
   */
  public async clearRelationship(
    property: keyof IModel<T> & string,
    options: IFmRelationshipOptions<S> = {}
  ): Promise<void> {
    const relType = this.META.relationship(property).relType;
    const fkRefs: string[] =
      relType === "hasMany"
        ? this._data[property]
          ? Object.keys(this.get(property))
          : []
        : this._data[property]
        ? [this.get(property) as unknown as string]
        : [];

    let paths: IFmPathValuePair[] = [];
    const now = new Date().getTime();

    fkRefs.map((ref) => {
      paths = [
        ...buildRelationshipPaths(this, property, ref, {
          now,
          operation: "remove",
        }),
        ...paths,
      ];
    });

    await relationshipOperation(
      this,
      "clear",
      property,
      fkRefs,
      paths,
      options
    );
  }

  /**
   * **setRelationship**
   *
   * sets up an FK relationship for a _hasOne_ relationship
   *
   * @param property the property containing the hasOne FK
   * @param ref the FK
   */
  public async setRelationship(
    property: keyof IModel<T> & string,
    fkId: ForeignKey,
    options: IFmRelationshipOptions<S> = {}
  ): Promise<void> {
    if (!fkId) {
      throw new FireModelError(
        `Failed to set the relationship ${this.modelName}.${property} because no FK was passed in!`,
        "firemodel/not-allowed"
      );
    }

    if (isHasManyRelationship<S, T>(this, property)) {
      throw new NotHasOneRelationship<S, T>(this, property, "setRelationship");
    }
    const paths = buildRelationshipPaths<T, S>(this, property, fkId, options);
    await relationshipOperation(this, "set", property, [fkId], paths, options);
  }

  //#endregion INSTANCE DEFINITION

  /**
   * get a property value from the record
   *
   * @param prop the property being retrieved
   */
  public get<K extends PropertyOf<T> | "lastUpdated" | "createdAt">(
    prop: K
  ): Readonly<T[K]> {
    return this.data[prop] as Readonly<T[K]>;
  }

  public toString() {
    return `Record::${this.modelName}@${this.id || "undefined"}`;
  }

  public toJSON() {
    return {
      dbPath: this.dbPath,
      modelName: this.modelName,
      pluralName: this.pluralName,
      key: this.id,
      compositeKey: this.compositeKey,
      localPath: this.localPath,
      data: this.data.toString(),
    };
  }
  //#endregion

  //#region PRIVATE METHODS

  // TODO: must be a better way to do this
  /**
   * Allows an empty Record to be initialized to a known state.
   * This is not intended to allow for mass property manipulation other
   * than at time of initialization
   *
   * @param data the initial state you want to start with
   */
  public async _initialize(
    data: Partial<IModel<T>>,
    options: IRecordOptions<S> = {}
  ): Promise<void> {
    if (data) {
      keys(data).map((key) => {
        this._data[key] = data[key];
      });
    }

    const relationships = getModelMeta(this).relationships;

    const hasManyRels = relationships
      .filter((r) => r.relType === "hasMany")
      .map((r) => r.property);

    const promises = [];
    /**
     * Sets hasMany to default `{}` if nothing was set.
     * Also, if the option `deepRelationships` is set to `true`,
     * it will look for relationships hashes instead of the typical
     * `fk: true` pairing.
     */
    for (const oneToManyProp of hasManyRels) {
      if (!this._data[oneToManyProp]) {
        this._data[oneToManyProp] = {} as T[typeof oneToManyProp];
      }
      if (options.setDeepRelationships) {
        if (this._data[oneToManyProp]) {
          promises.push(buildDeepRelationshipLinks(this, oneToManyProp));
        }
      }
    }
    await Promise.all(promises).finally(() => {
      if (!FireModel.defaultDb) {
        FireModel.defaultDb = options.db;
      }
    });

    const now = new Date().getTime();
    if (!this._data.lastUpdated) {
      this._data.lastUpdated = now;
    }
    if (!this._data.createdAt) {
      this._data.createdAt = now;
    }
  }

  /**
   * **_localCrudOperation**
   *
   * updates properties on a given Record while firing
   * two-phase commit EVENTs to dispatch:
   *
   *  local: `RECORD_[ADDED,CHANGED,REMOVED]_LOCALLY`
   *  server: `RECORD_[ADDED,CHANGED,REMOVED]_CONFIRMATION`
   *
   * Note: if there is an error a
   * `RECORD_[ADDED,CHANGED,REMOVED]_ROLLBACK` event will be sent
   * to dispatch instead of the server dispatch message
   * illustrated above.
   *
   * Another concept that is sometimes not clear ... when a
   * successful transaction is achieved you will by default get
   * both sides of the two-phase commit. If you have a watcher
   * watching this same path then that watcher will also get
   * a dispatch message sent (e.g., RECORD_ADDED, RECORD_REMOVED, etc).
   *
   * If you only want to hear about Firebase's acceptance of the
   * record from a watcher then you can opt-out by setting the
   * { silentAcceptance: true } parameter in options. If you don't
   * want either side of the two phase commit sent to dispatch
   * you can mute both with { silent: true }. This option is not
   * typically a great idea but it can be useful in situations like
   * _mocking_
   */
  protected async _localCrudOperation(
    crudAction: IFmCrudOperations,
    priorValue: T,
    options: IFmDispatchOptions = {}
  ) {
    options = {
      ...{ silent: false, silentAcceptance: false },
      ...options,
    };
    const transactionId: string =
      "t-" +
      Math.random().toString(36).substr(2, 5) +
      "-" +
      Math.random().toString(36).substr(2, 5);
    const lookup: IDictionary<FmEvents[]> = {
      add: [
        FmEvents.RECORD_ADDED_LOCALLY,
        FmEvents.RECORD_ADDED_CONFIRMATION,
        FmEvents.RECORD_ADDED_ROLLBACK,
      ],
      update: [
        FmEvents.RECORD_CHANGED_LOCALLY,
        FmEvents.RECORD_CHANGED_CONFIRMATION,
        FmEvents.RECORD_CHANGED_ROLLBACK,
      ],
      remove: [
        FmEvents.RECORD_REMOVED_LOCALLY,
        FmEvents.RECORD_REMOVED_CONFIRMATION,
        FmEvents.RECORD_REMOVED_ROLLBACK,
      ],
    };
    const [actionTypeStart, actionTypeEnd, actionTypeFailure] =
      lookup[crudAction];

    // Set aside prior value
    const { changed, added, removed } = compareHashes<T>(
      withoutMetaOrPrivate<T>(this.data),
      withoutMetaOrPrivate<T>(priorValue)
    );

    const watchers = findWatchers(
      this.dbPath
    ) as unknown as IWatcherEventContext<S, T>[];
    const event: Omit<IFmLocalRecordEvent<T>, "type"> = {
      transactionId,
      modelConstructor: this.modelConstructor,
      kind: "record",
      operation: crudAction,
      eventType: "local",
      key: this.id,
      value: withoutMetaOrPrivate<T>(this.data),
      priorValue,
    };

    if (crudAction === "update") {
      event.priorValue = priorValue;
      event.added = added;
      event.changed = changed;
      event.removed = removed;
    }

    if (watchers.length === 0) {
      if (!options.silent) {
        // Note: if used on frontend, the mutations must be careful to
        // set this to the right path considering there is no watcher
        await this.dispatch(
          UnwatchedLocalEvent(this, {
            type: actionTypeStart,
            ...event,
          })
        );
      }
    } else {
      // For each watcher watching this DB path ...
      const dispatch = WatchDispatcher<S, T>(this.dispatch);
      for (const watcher of watchers) {
        if (!options.silent) {
          await dispatch(watcher)({ type: actionTypeStart, ...event });
        }
      }
    }

    // Send CRUD to Firebase
    try {
      if (this.db.isMockDb && this.db.mock && options.silent) {
        // this.db.mock.silenceEvents();
      }
      this._data.lastUpdated = new Date().getTime();
      const path = this.dbPath;
      switch (crudAction) {
        case "remove":
          try {
            this.dbPath;
          } catch (e) {
            throw new FireModelProxyError(
              e,
              `The attempt to "remove" the ${capitalize(
                this.modelName
              )} with ID of "${
                this.id
              }" has been aborted. This is often because you don't have the right properties set for the dynamic path. This model requires the following dynamic properties to uniquely define (and remove) it: ${this.dynamicPathComponents.join(
                ", "
              )}`
            );
          }

          // Check for relationship props and dis-associate
          // before removing the actual record
          // TODO: need to add tests for this!
          for (const rel of this.relationships) {
            const relProperty = this.get(rel.property);
            try {
              if (rel.relType === "hasOne" && relProperty) {
                await this.disassociate(
                  rel.property,
                  this.get(rel.property) as unknown as ForeignKey
                );
              } else if (rel.relType === "hasMany" && relProperty) {
                for (const relFk of Object.keys(relProperty)) {
                  await this.disassociate(rel.property, relFk);
                }
              }
            } catch (e) {
              throw new FireModelProxyError(
                e,
                `While trying to remove ${capitalize(this.modelName)}.${
                  this.id
                } from the database, problems were encountered removing the relationship defined by the "${
                  rel.property
                } property (which relates to the model ${
                  rel.fkModelName
                }). This relationship has a cardinality of "${
                  rel.relType
                }" and the value(s) were: ${
                  rel.relType === "hasOne"
                    ? JSON.stringify(Object.keys(this.get(rel.property)))
                    : JSON.stringify(this.get(rel.property))
                }`
              );
            }
          }

          await this.db.remove(this.dbPath);
          break;
        case "add":
          try {
            await this.db.set(path, this.data);
          } catch (e) {
            throw new FireModelProxyError(
              e,
              `Problem setting the "${path}" database path. Data passed in was of type ${typeof this
                .data}. Error message encountered was: ${String(e.message)}`,
              `firemodel/${
                e.code === "PERMISSION_DENIED" ? "permission-denied" : "set-db"
              }`
            );
          }
          break;
        case "update":
          await this.db.update(
            "/",
            this._getPaths(this, { changed, added, removed })
          );
          break;
      }

      // send confirm event
      if (!options.silent && !options.silentAcceptance) {
        if (watchers.length === 0) {
          const evt: IFmLocalEvent<T> = {
            type: actionTypeEnd,
            ...event,
            transactionId,
            value: withoutMetaOrPrivate<T>(this.data),
          };
          await this.dispatch(UnwatchedLocalEvent(this, evt));
        } else {
          const dispatch = WatchDispatcher<S, T>(this.dispatch);
          for (const watcher of watchers) {
            if (!options.silent) {
              await dispatch(watcher)({ type: actionTypeEnd, ...event });
            }
          }
        }
      }
      if (this.db.isMockDb && this.db.mock && options.silent) {
        // this.db.mock.restoreEvents();
      }
    } catch (e) {
      // send failure event
      await this.dispatch(
        UnwatchedLocalEvent<S, T>(this, {
          type: actionTypeFailure,
          ...event,
          transactionId,
          value: withoutMetaOrPrivate<T>(this.data),
        })
      );

      throw new RecordCrudFailure(this, crudAction, transactionId, e);
    }
  }

  private _findDynamicComponents(path = ""): PropertyOf<T>[] {
    if (!path.includes(":")) {
      return [];
    }
    const results: Array<PropertyOf<T>> = [];
    let remaining = path;
    let index = remaining.indexOf(":");

    while (index !== -1) {
      remaining = remaining.slice(index);
      const prop = remaining.replace(/:(\w+).*/, "$1");
      results.push(prop as PropertyOf<T>);
      remaining = remaining.replace(`:${prop}`, "");
      index = remaining.indexOf(":");
    }

    return results;
  }

  /**
   * looks for ":name" property references within the dbOffset or localPrefix and expands them
   */
  private _injectDynamicPathProperties(
    path: string,
    forProp: "dbOffset" | "localPath" = "dbOffset"
  ) {
    this.dynamicPathComponents.forEach((prop) => {
      const value = this.data[prop as keyof T];

      if (value ? false : true) {
        throw new FireModelError(
          `You can not ask for the ${forProp} on a model like "${
            this.modelName
          }" which has a dynamic property of "${prop}" before setting that property [ data: ${JSON.stringify(
            this.data
          )} ].`,
          "record/not-ready"
        );
      }
      if (!["string", "number"].includes(typeof value)) {
        throw new FireModelError(
          `The path is using the property "${prop}" on ${
            this.modelName
          } as a part of the route path but that property must be either a string or a number and instead was a ${typeof prop}`,
          "record/not-allowed"
        );
      }
      path = path.replace(`:${prop}`, String(this.get(prop)));
    });

    return path;
  }

  /**
   * Load data from a record in database; works with `get` static initializer
   * to prep the initial data.
   */
  private async _getFromDatabase(id: PrimaryKey<T>) {
    if (isCompositeString(id)) {
      id = createCompositeKey<T>(id);
    }

    // set PK value(s)
    if (typeof id === "string") {
      this._data.id = id;
    } else {
      for (const [k, v] of entries(id)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this._data as any)[k] = v;
      }
    }

    // now that record's primary key is loaded, we retrieve data from server
    const data = await this.db.getRecord<T>(this.dbPath);

    if (data && data.id) {
      await this._initialize(data);
    } else {
      throw new FireModelError(
        `Failed to load the Record "${this.modelName}::${
          this.id
        }" with composite key of:\n ${JSON.stringify(keys, null, 2)}`,
        "firebase/no-record-found"
      );
    }

    return this;
  }

  /**
   * Allows for the static "add" method to add a record
   */
  private async _adding(options: IRecordOptions<S>) {
    if (!this.id) {
      this.id = fbKey();
    }
    const now = new Date().getTime();
    if (!this.get("createdAt")) {
      this._data.createdAt = now;
    }
    this._data.lastUpdated = now;

    // TODO: need to ensure that relationship which are set
    // are updated using the _relationship_ based methods associate/disassociate
    // so that bi-lateral relationships are established/maintained
    if (!this.db) {
      throw new FireModelError(
        `An attempt to add a ${capitalize(
          this.modelName
        )} record failed as the Database has not been connected yet. Try setting FireModel's defaultDb first.`,
        "firemodel/db-not-ready"
      );
    }

    await this._localCrudOperation(IFmCrudOperations.add, undefined, options);
    // now that the record has been added we need to follow-up with any relationship fk's that
    // were part of this record. For these we must run an `associate` over them to ensure that
    // inverse properties are established in the inverse direction
    const relationshipsTouched = this.relationships
      .reduce((agg, rel) => {
        if (
          rel.relType === "hasMany" &&
          Object.keys(this.data[rel.property]).length > 0
        ) {
          return [...agg, rel.property];
        } else if (rel.relType === "hasOne" && this.data[rel.property]) {
          return [...agg, rel.property];
        } else {
          return agg;
        }
      }, [])
      .filter((prop) => this.META.relationship(prop).inverseProperty);

    const promises = [];
    try {
      for (const prop of relationshipsTouched) {
        const meta = this.META.relationship(prop);
        if (meta.relType === "hasOne") {
          promises.push(this.associate(prop, this.get(prop) as ForeignKey));
        }
        if (meta.relType === "hasMany") {
          Object.keys(this.get(prop)).forEach((fkRef) =>
            promises.push(this.associate(prop, fkRef))
          );
        }
      }
      await Promise.all(promises);
    } catch (e) {
      throw new FireModelProxyError(
        e,
        `An ${capitalize(this.modelName)} [${
          this.id
        }] model was being added but when attempting to add in the relationships which were inferred by the record payload it ran into problems. The relationship(s) which had properties defined -- and which had a bi-lateral FK relationship (e.g., both models will track the relationship versus just the ${capitalize(
          this.modelName
        )} [${this.id} model) --  were: ${relationshipsTouched.join(", ")}`
      );
    } finally {
      if (!FireModel.defaultDb) {
        FireModel.defaultDb = options.db;
      }
    }

    return this;
  }

  //#endregion PRIVATE METHODS
}
