/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { slashNotation } from './index';
import {
  IComparisonOperator,
  IFirebaseRtdbQuery,
  IModel,
  IRtdbDataSnapshot,
  IRtdbOrder,
  ISerializedIdentity,
  ISerializedQuery,
  IRtdbDatabase,
  IAdminRtdbDatabase,
  IClientRtdbDatabase,
  IFirebaseRtdbReference,
} from '@forest-fire/types';

/**
 * Provides a way to serialize the full characteristics of a Firebase Realtime
 * Database query.
 */
export class SerializedRealTimeQuery<
  TSdk extends 'RealTimeAdmin' | 'RealTimeClient',
  M extends IModel = IModel,
  TDatabase extends IRtdbDatabase = TSdk extends 'RealTimeAdmin'
    ? IAdminRtdbDatabase
    : IClientRtdbDatabase
> implements ISerializedQuery<'RealTimeAdmin' | 'RealTimeClient', M>
{
  protected _endAtKey?: keyof M & string;
  protected _endAt?: string | number | boolean;
  protected _equalToKey?: keyof M & string;
  protected _equalTo?: string | number | boolean;
  protected _limitToFirst?: number;
  protected _limitToLast?: number;
  protected _orderKey?: keyof M & string;
  protected _path: string;
  protected _startAtKey?: keyof M & string;
  protected _startAt?: string | number | boolean;
  protected _db?: TDatabase;
  protected _orderBy: IRtdbOrder = 'orderByKey';

  /**
   * Constructor
   */
  constructor(path = '/') {
    this._path = slashNotation(path);
  }

  // static create<S extends "RealTimeAdmin" | "RealTimeClient", M extends IModel = IModel, D extends IRtdbDatabase = S extends "RealTimeAdmin" ? IAdminRtdbDatabase : IClientRtdbDatabase>(db: D, path = "/") {
  //   const q = new SerializedRealTimeQuery<S, M>(path)
  //   q.setDB(db);
  //   return q;
  // }

  public get db(): TDatabase {
    if (!this._db) {
      throw new Error(
        'Attempt to use SerializedFirestoreQuery without setting database'
      );
    }

    return this._db;
  }

  public set db(value: TDatabase) {
    this._db = value;
  }

  public get path(): string {
    return this._path;
  }

  public get identity(): ISerializedIdentity<M> {
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
  public setDB(db: TDatabase): SerializedRealTimeQuery<TSdk, M> {
    this._db = db;
    return this as SerializedRealTimeQuery<TSdk, M>;
  }

  public setPath(path: string): SerializedRealTimeQuery<TSdk, M> {
    this._path = slashNotation(path);
    return this as SerializedRealTimeQuery<TSdk, M>;
  }

  public limitToFirst(value: number): SerializedRealTimeQuery<TSdk, M> {
    this._limitToFirst = value;
    return this as SerializedRealTimeQuery<TSdk, M>;
  }

  public limitToLast(value: number): SerializedRealTimeQuery<TSdk, M> {
    this._limitToLast = value;
    return this as SerializedRealTimeQuery<TSdk, M>;
  }

  public orderByChild(
    child: keyof M & string
  ): SerializedRealTimeQuery<TSdk, M> {
    this._orderBy = 'orderByChild';
    this._orderKey = child;
    return this as SerializedRealTimeQuery<TSdk, M>;
  }

  public orderByValue(): SerializedRealTimeQuery<TSdk, M> {
    this._orderBy = 'orderByValue';
    return this as SerializedRealTimeQuery<TSdk, M>;
  }

  public orderByKey(): SerializedRealTimeQuery<TSdk, M> {
    this._orderBy = 'orderByKey';
    return this as SerializedRealTimeQuery<TSdk, M>;
  }

  public startAt(
    value: string | number | boolean,
    key?: keyof M & string
  ): SerializedRealTimeQuery<TSdk, M> {
    this._startAt = value;
    this._startAtKey = key;
    return this as SerializedRealTimeQuery<TSdk, M>;
  }

  public endAt(
    value: string | number | boolean,
    key?: keyof M & string
  ): SerializedRealTimeQuery<TSdk, M> {
    this._endAt = value;
    this._endAtKey = key;
    return this as SerializedRealTimeQuery<TSdk, M>;
  }

  public equalTo(
    value: string | number | boolean,
    key?: keyof M & string
  ): SerializedRealTimeQuery<TSdk, M> {
    this._equalTo = value;
    this._equalToKey = key;
    return this as SerializedRealTimeQuery<TSdk, M>;
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

  public deserialize(db?: IRtdbDatabase): IFirebaseRtdbReference {
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

    return q as IFirebaseRtdbReference;
  }

  public async execute(db?: IRtdbDatabase): Promise<IRtdbDataSnapshot> {
    const database = db || this.db;
    const snapshot = await this.deserialize(database).once('value');
    return snapshot;
  }

  public where(
    operation: IComparisonOperator,
    value: string | number | boolean,
    key?: keyof M & string
  ): SerializedRealTimeQuery<TSdk, M> {
    switch (operation) {
      case '=':
        return this.equalTo(value, key);
      case '>':
        return this.startAt(value, key);
      case '<':
        return this.endAt(value, key);
    }
  }

  public toJSON(): ISerializedIdentity<M> {
    return this.identity;
  }

  public toString(): string {
    return JSON.stringify(this.identity, null, 2);
  }
}
