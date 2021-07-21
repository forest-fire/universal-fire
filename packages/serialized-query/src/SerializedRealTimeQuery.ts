/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { slashNotation } from './index';
import {
  IComparisonOperator,
  IFirebaseRtdbQuery,
  IRtdbOrder,
  ISerializedIdentity,
  ISerializedQuery,
  IRtdbSdk,
  DbFrom,
  SnapshotFrom,
  DeserializedQueryFrom,
} from '@forest-fire/types';

/**
 * Provides a way to serialize the full characteristics of a Firebase Realtime
 * Database query.
 */
export class SerializedRealTimeQuery<
  TSdk extends IRtdbSdk,
  TData extends unknown = Record<string, unknown>
  > implements ISerializedQuery<TSdk, TData>
{
  protected _endAtKey?: keyof TData & string;
  protected _endAt?: string | number | boolean;
  protected _equalToKey?: keyof TData & string;
  protected _equalTo?: string | number | boolean;
  protected _limitToFirst?: number;
  protected _limitToLast?: number;
  protected _orderKey?: keyof TData & string;
  private _path: string;
  protected _startAtKey?: keyof TData & string;
  protected _startAt?: string | number | boolean;
  protected _db?: DbFrom<TSdk>;
  protected _orderBy: IRtdbOrder = 'orderByKey';

  /**
   * Constructor
   */
  constructor(path = '/') {
    this._path = slashNotation(path);
  }

  public get db(): DbFrom<TSdk> {
    if (!this._db) {
      throw new Error(
        'Attempt to use SerializedFirestoreQuery without setting database'
      );
    }

    return this._db;
  }

  public set db(value: DbFrom<TSdk>) {
    this._db = value;
  }

  public get path(): string {
    return this._path;
  }

  public get identity(): ISerializedIdentity<TSdk, TData> {
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
  public setDB(db: DbFrom<TSdk>): SerializedRealTimeQuery<TSdk, TData> {
    this._db = db;
    return this as SerializedRealTimeQuery<TSdk, TData>;
  }

  public setPath(path: string): SerializedRealTimeQuery<TSdk, TData> {
    this._path = slashNotation(path);
    return this;
  }

  public limitToFirst(value: number): SerializedRealTimeQuery<TSdk, TData> {
    this._limitToFirst = value;
    return this;
  }

  public limitToLast(value: number): SerializedRealTimeQuery<TSdk, TData> {
    this._limitToLast = value;
    return this;
  }

  public orderByChild(
    child: keyof TData & string
  ): SerializedRealTimeQuery<TSdk, TData> {
    this._orderBy = 'orderByChild';
    this._orderKey = child;
    return this;
  }

  public orderByValue(): SerializedRealTimeQuery<TSdk, TData> {
    this._orderBy = 'orderByValue';
    return this;
  }

  public orderByKey(): SerializedRealTimeQuery<TSdk, TData> {
    this._orderBy = 'orderByKey';
    return this;
  }

  public startAt(
    value: string | number | boolean,
    key?: keyof TData & string
  ): SerializedRealTimeQuery<TSdk, TData> {
    this._startAt = value;
    this._startAtKey = key;
    return this;
  }

  public endAt(
    value: string | number | boolean,
    key?: keyof TData & string
  ): SerializedRealTimeQuery<TSdk, TData> {
    this._endAt = value;
    this._endAtKey = key;
    return this;
  }

  public equalTo(
    value: string | number | boolean,
    key?: keyof TData & string
  ): SerializedRealTimeQuery<TSdk, TData> {
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

  public deserialize(db?: DbFrom<TSdk>): DeserializedQueryFrom<TSdk> {
    const database = db || this.db;
    let q = database.ref(this.path) as unknown as IFirebaseRtdbQuery;
    switch (this._orderBy) {
      case 'orderByKey':
        q = q.orderByKey();
        break;
      case 'orderByValue':
        q = q.orderByValue();
        break;
      case 'orderByChild':
        q = q.orderByChild(this.identity.orderByKey);
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

    return q as DeserializedQueryFrom<TSdk>;
  }

  public async execute(db?: DbFrom<TSdk>): Promise<SnapshotFrom<TSdk>> {
    const database = db || this.db;
    const snapshot = await this.deserialize(database).once('value');
    return snapshot as SnapshotFrom<TSdk>;
  }

  public where(
    operation: IComparisonOperator,
    value: string | number | boolean,
    key?: keyof TData & string
  ): SerializedRealTimeQuery<TSdk, TData> {
    switch (operation) {
      case '=':
        return this.equalTo(value, key);
      case '>':
        return this.startAt(value, key);
      case '<':
        return this.endAt(value, key);
    }
  }

  public toJSON(): ISerializedIdentity<TSdk, TData> {
    return this.identity;
  }

  public toString(): string {
    return JSON.stringify(this.identity, null, 2);
  }
}
