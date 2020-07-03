import type { IFirestoreQuery, IRealTimeQuery } from "@forest-fire/types";
import type {
  IComparisonOperator,
  IFirestoreQueryOrderType,
  IRealQueryOrderType,
  ISerializedIdentity,
  ISimplifiedDatabase,
 } from "./@types/serialized-types";

export abstract class BaseSerializer<T = any> {
  protected _endAtKey?: keyof T & string;
  protected _endAt?: string;
  protected _equalToKey?: keyof T & string;
  protected _equalTo?: string;
  protected _limitToFirst?: number;
  protected _limitToLast?: number;
  protected _orderKey?: keyof T & string;
  protected _path: string;
  protected _startAtKey?: keyof T & string;
  protected _startAt?: string;
  protected _db?: ISimplifiedDatabase;
  protected abstract _orderBy: IFirestoreQueryOrderType | IRealQueryOrderType;

  static async create<T extends BaseSerializer>(
    constructor: new (path: string) => T,
    path: string = "/"
  ) {
    return new constructor(path);
  }

  constructor(path: string = "/") {
    this._path = slashNotation(path);
  }

  public get db() {
    if (this._db) {
      return this._db;
    }
    throw new Error("Attempt to use SerializedQuery without setting database");
  }

  public get path() {
    return this._path;
  }

  public get identity(): ISerializedIdentity<T> {
    return {
      endAtKey: this._endAtKey,
      endAt: this._endAt,
      equalToKey: this._equalToKey,
      equalTo: this._equalTo,
      limitToFirst: this._limitToFirst,
      limitToLast: this._limitToLast,
      orderByKey: this._orderKey,
      orderBy: this._orderBy,
      path: this._path,
      startAtKey: this._startAtKey,
      startAt: this._startAt,
    };
  }

  /**
   * Allows the DB interface to be setup early, allowing clients
   * to call execute without any params.
   */
  public setDB(db: ISimplifiedDatabase) {
    this._db = db;
    return this;
  }

  public setPath(path: string) {
    this._path = slashNotation(path);
    return this;
  }

  /**
   * Returns a unique numeric hashcode for this query
   */
  public hashCode() {
    const identity = JSON.stringify(this.identity);
    let hash = 0;
    if (identity.length === 0) {
      return hash;
    }
    for (let i = 0; i < identity.length; i++) {
      const char = identity.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      // Convert to 32bit integer.
      hash = hash & hash;
    }
    return hash;
  }

  public limitToFirst(value: number) {
    this._limitToFirst = value;
    return this;
  }

  public limitToLast(value: number) {
    this._limitToLast = value;
    return this;
  }

  public orderByChild(child: keyof T & string) {
    this._orderBy = "orderByChild";
    this._orderKey = child;
    return this;
  }

  public orderByValue() {
    this._orderBy = "orderByValue";
    return this;
  }

  public orderByKey() {
    this._orderBy = "orderByKey";
    return this;
  }

  public startAt(value: any, key?: keyof T & string) {
    this._startAt = value;
    this._startAtKey = key;
    return this;
  }

  public endAt(value: any, key?: keyof T & string) {
    this._endAt = value;
    this._endAtKey = key;
    return this;
  }

  public equalTo(value: any, key?: keyof T & string) {
    this._equalTo = value;
    this._equalToKey = key;
    return this;
  }

  public toJSON() {
    return this.identity;
  }

  public toString() {
    return JSON.stringify(this.identity, null, 2);
  }

  /**
   * Generates a `Query` from the _state_ in this serialized query.
   */
  public abstract deserialize(db?: ISimplifiedDatabase): IFirestoreQuery | IRealTimeQuery;

  /**
   * Execute the query as a one time fetch.
   */
  public abstract async execute(db?: ISimplifiedDatabase): Promise<any>;

  /**
   * Allows a shorthand notation for simple serialized queries.
   */
  public abstract where<V>(
    operation: IComparisonOperator,
    value: V,
    key?: (keyof T & string) | undefined
  ): this;
}

function slashNotation(path: string) {
  return path.replace(/\./g, "/");
}
