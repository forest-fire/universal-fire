/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { SerializedError, slashNotation } from './index';
import {
  IComparisonOperator,
  IFirebaseRtdbQuery,
  IModel,
  IRealTimeApi,
  IRtdbDatabase,
  IRtdbDataSnapshot,
  IRtdbOrder,
  ISerializedIdentity,
  ISerializedQuery,
} from '@forest-fire/types';

/**
 * Provides a way to serialize the full characteristics of a Firebase Realtime
 * Database query.
 */
export class SerializedRealTimeQuery<
  T extends IModel = Record<string, unknown> & IModel
> implements ISerializedQuery<T, IRealTimeApi> {
  protected _endAtKey?: keyof T & string;
  protected _endAt?: string | number | boolean;
  protected _equalToKey?: keyof T & string;
  protected _equalTo?: string | number | boolean;
  protected _limitToFirst?: number;
  protected _limitToLast?: number;
  protected _orderKey?: keyof T & string;
  protected _path: string;
  protected _startAtKey?: keyof T & string;
  protected _startAt?: string | number | boolean;
  protected _db?: IRealTimeApi;
  protected _orderBy: IRtdbOrder = 'orderByKey';

  /** Static Initializer */
  public static path<T extends IModel>(path = '/'): SerializedRealTimeQuery<T> {
    return new SerializedRealTimeQuery<T>(path);
  }

  /**
   * Constructor
   */
  constructor(path = '/') {
    this._path = slashNotation(path);
  }

  public get db(): IRealTimeApi {
    if (this._db) {
      return this._db;
    }
    throw new Error(
      'Attempt to use SerializedFirestoreQuery without setting database'
    );
  }

  public set db(value: IRealTimeApi) {
    this._db = value;
  }

  public get path(): string {
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
  public setDB(db: IRealTimeApi): SerializedRealTimeQuery<T> {
    this._db = db;
    return this;
  }

  public setPath(path: string): SerializedRealTimeQuery<T> {
    this._path = slashNotation(path);
    return this;
  }

  public limitToFirst(value: number): SerializedRealTimeQuery<T> {
    this._limitToFirst = value;
    return this;
  }

  public limitToLast(value: number): SerializedRealTimeQuery<T> {
    this._limitToLast = value;
    return this;
  }

  public orderByChild(child: keyof T & string): SerializedRealTimeQuery<T> {
    this._orderBy = 'orderByChild';
    this._orderKey = child;
    return this;
  }

  public orderByValue(): SerializedRealTimeQuery<T> {
    this._orderBy = 'orderByValue';
    return this;
  }

  public orderByKey(): SerializedRealTimeQuery<T> {
    this._orderBy = 'orderByKey';
    return this;
  }

  public startAt(
    value: string | number | boolean,
    key?: keyof T & string
  ): SerializedRealTimeQuery<T> {
    this._startAt = value;
    this._startAtKey = key;
    return this;
  }

  public endAt(
    value: string | number | boolean,
    key?: keyof T & string
  ): SerializedRealTimeQuery<T> {
    this._endAt = value;
    this._endAtKey = key;
    return this;
  }

  public equalTo(
    value: string | number | boolean,
    key?: keyof T & string
  ): SerializedRealTimeQuery<T> {
    this._equalTo = value;
    this._equalToKey = key;
    return this;
  }

  /**
   * Returns a unique numeric hashcode for this query
   */
  public hashCode(): number {
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

  public deserialize(db?: IRealTimeApi): IFirebaseRtdbQuery {
    const database = db || this.db;
    let q: IFirebaseRtdbQuery = database.ref(this.path);

    switch (this._orderBy) {
      case 'orderByKey':
        q = q.orderByKey();
        break;
      case 'orderByValue':
        q = q.orderByValue();
        break;
      case 'orderByChild':
        q = q.orderByChild(this.identity.orderByKey as string);
        break;
    }
    if (this.identity.limitToFirst) {
      q = q.limitToFirst(this.identity.limitToFirst);
    }
    if (this.identity.limitToLast) {
      q = q.limitToLast(this.identity.limitToLast);
    }
    if (this.identity.startAt) {
      q = q.startAt(this.identity.startAt, this.identity.startAtKey);
    }
    if (this.identity.endAt) {
      q = q.endAt(this.identity.endAt, this.identity.endAtKey);
    }
    if (this.identity.equalTo) {
      q = this.identity.equalToKey
        ? q.equalTo(this.identity.equalTo, this.identity.equalToKey)
        : q.equalTo(this.identity.equalTo);
    }
    return q;
  }

  public async execute(db?: IRealTimeApi): Promise<IRtdbDataSnapshot> {
    const database = db || this.db;
    const snapshot = await this.deserialize(database).once('value');
    return snapshot;
  }

  public where(
    operation: IComparisonOperator,
    value: string | number | boolean,
    key?: keyof T & string
  ): ISerializedQuery<T, IRealTimeApi> {
    switch (operation) {
      case '=':
        return this.equalTo(value, key);
      case '>':
        return this.startAt(value, key);
      case '<':
        return this.endAt(value, key);
      default:
        throw new SerializedError(
          `Unknown comparison operator: ${operation}`,
          'invalid-operator'
        );
    }
  }

  public toJSON(): ISerializedIdentity<T> {
    return this.identity;
  }

  public toString(): string {
    return JSON.stringify(this.identity, null, 2);
  }
}
