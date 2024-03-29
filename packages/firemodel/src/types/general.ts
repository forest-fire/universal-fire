import type { IDatabaseSdk, ISdk } from "@forest-fire/types";
import { IDictionary, datetime, ConstructorFor } from "common-types";
import { IModel, PrimaryKey, PropertyOf } from "~/types";
import type { FireModelError } from "~/errors";
import { Model } from "~/models/Model";
export interface IUnderlyingError<T extends Model> {
  /** an identifying characteristic of the individual error */
  id: string | PrimaryKey<T>;
  /** the error itself */
  error: FireModelError;
}


export type FmModelConstructor<T extends Model> = ConstructorFor<T>;

/** _options_ allowed to modify the behavior/configuration of a `Model` */
export interface IModelOptions<T extends ISdk = ISdk> {
  logger?: ILogger;
  db?: IDatabaseSdk<T>;
}

export enum SortOrder {
  /** Sort in Ascending order */
  ASC = "ASC",
  /** Sort in Decending order */
  DEC = "DEC",
}

/**
 * **IWatchOptions**
 *
 * provides options to configure `Watch` triggered listeners
 * on Firebase databases.
 */
export interface IWatchOptions<T extends Model> extends Omit<IListOptions<ISdk, T>, "paginate"> {
  /**
   * Filters the results returned by the watched query prior to _dispatch_
   * which allows a way to only send a subset of records to the state management
   * tool of choice.
   *
   * ```ts
   * const r1 = await Watch.since(
   *    MyMusic,
   *    new Date().getTime(),
   *    { filter: m => m.genre === 'rap' }
   *);
   * ```
   *
   * In this example, the watcher will return _all_ changes it detects on `MyMusic`
   * in Firebase. However, with the filter, only music categorized as "rap" will be
   * dispatched.
   */
  filter?: (rec: T) => boolean;
}

/**
 * **IListOptions**
 *
 * provides options to configure `List` based queries
 */
export interface IListOptions<S extends ISdk, T extends Model>
  extends IModelOptions {
  offsets?: Partial<IModel<T>>;
  /**
   * optionally use an _explicit_ database connection rather than the
   * _default_ connection located at `FireModel.defaultDb`.
   */
  db?: IDatabaseSdk<S>;

  /**
   * Specifies which property in the Model should be used to order the query
   * results on the server.
   *
   * If using the **RTDB**, you will typically want to make sure that
   * properties which you order by are marked with a `@index` in
   * the Model definition to ensure performant results.
   *
   * When using **Firestore**, everything is automaticaly indexed so
   * it's not as critical but is still considered a good practice
   * because it shows intent in your model but also because if you use caching
   * layers like **IndexedDB** you will need to explicit articulation
   * of indexes anyway.
   */
  orderBy?: PropertyOf<T>;
  /**
   * **limitToFirst**
   *
   * When the server has run the query this allows a descrete limit of
   * records to be returned to the client. This reduces network traffic
   * and also your Firebase bill (_since that's related to how much you
   * send over the wire_ from Firebase).
   *
   * > Note: The "first" records are determined by the query's `orderBy`
   * property
   */
  limitToFirst?: number;
  /**
   * **limitToFirst**
   *
   * When the server has run the query this allows a descrete limit of
   * records to be returned to the client. This reduces network traffic
   * and also your Firebase bill (_since that's related to how much you
   * send over the wire_ from Firebase).
   *
   * > Note: The "last" records are determined by the query's `orderBy`
   * property
   */
  limitToLast?: number;

  /**
   * **startAt**
   *
   * Once the results of a query have been calculated by Firebase, you can use
   * the parameter to _start at_ a record after the first record in the array.
   *
   * > **Note:** in pagination scenarios you may consider using the the `List.paginate(x)`
   * > API instead of building your own.
   */
  startAt?: number;

  /**
   * **endAt**
   *
   * Once the results of a query have been calculated by Firebase, you can use
   * the parameter to _end at_ a record after the first record in the array.
   *
   * > **Note:** in pagination scenarios you may consider using the the `List.paginate(x)`
   * > API instead of building your own.
   */
  endAt?: number;

  /**
   * Turn on pagination by stating the page _size_ in the options hash
   */
  paginate?: number;
}

export type IListQueryOptions<S extends ISdk, T extends Model> = Omit<
  IListOptions<S, T>,
  "orderBy" | "limitToFirst" | "limitToLast" | "startAt" | "endAt"
>;

export interface IMetaData {
  attributes: IDictionary;
  relationships: IDictionary<IRelationship>;
}

export interface IAuditFilter {
  /** audit entries since a given unix epoch timestamp */
  since?: number;
  /** the last X number of audit entries */
  last?: number;
}

export type IComparisonOperator = "=" | ">" | "<";
export type IConditionAndValue = [
  IComparisonOperator,
  boolean | string | number
];
export type FirebaseCrudOperations = "push" | "set" | "update" | "remove";

export interface IAuditRecord {
  crud: FirebaseCrudOperations;
  when: datetime;
  schema: string;
  key: string;
  info: IDictionary;
}

export interface ILogger {
  log: (message: string) => void;
  warn: (message: string) => void;
  debug: (message: string) => void;
  error: (message: string) => void;
}

export interface IRelationship {
  cardinality: string;
  policy: RelationshipPolicy;
}
export enum RelationshipPolicy {
  keys = "keys",
  lazy = "lazy",
  inline = "inline",
}
export enum RelationshipCardinality {
  hasMany = "hasMany",
  belongsTo = "belongsTo",
}

/**
 * a gathering of name/value pairs which are to be changed
 * in the database but which have a root path which define
 * their fully qualified path.
 *
 * Often used to feed into a MPS object.
 */
export interface IFmDatabasePaths {
  /** a dictionary of name/values where the "name" is relative path off the root */
  paths: IFmPathValuePair[];
  /** the fully qualified paths in the DB which will be effected */
  fullPathNames: string[];
  /** the root path which all paths originate from */
  root: string;
}

export interface IFmPathValuePair {
  /** the path in the DB */
  path: string;
  /** the value at the given path */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}
/**
 * A record which _does_ have the `id` property set
 */
export type IFmHasId<T extends IModel<Model> = IModel<Model>> = {
  id: Required<T["id"]>;
}

/**
 * Get the type of an Object's property
 */
export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
