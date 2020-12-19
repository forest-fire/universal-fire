import type { IDictionary } from 'common-types';

import { BaseSerializer, slashNotation } from './index';
import {
  IComparisonOperator,
  IRtdbOrder,
  IRealTimeQuery,
  ISimplifiedDatabase,
  RtdbOrder,
  IRtdbDataSnapshot,
  ISerializedQuery,
  IModel,
  IRtdbDatabase,
} from '@forest-fire/types';

/**
 * Provides a way to serialize the full characteristics of a Firebase Realtime
 * Database query.
 */
export class SerializedRealTimeQuery<T extends IModel>
  implements ISerializedQuery<T> {
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
  protected _db?: IRtdbDatabase;
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

  public get db(): IRtdbDatabase {
    if (this._db) {
      return this._db;
    }
    throw new Error(
      'Attempt to use SerializedFirestoreQuery without setting database'
    );
  }

  public set db(value: IRtdbDatabase) {
    this._db = value;
  }

  public startAt(value: any, key?: keyof T & string) {
    this.validateKey('startAt', key, [
      RtdbOrder.orderByChild,
      RtdbOrder.orderByValue,
    ]);
    super.startAt(value, key);
    return this;
  }

  public endAt(value: any, key?: keyof T & string) {
    this.validateKey('endAt', key, [
      RtdbOrder.orderByChild,
      RtdbOrder.orderByValue,
    ]);
    super.endAt(value, key);
    return this;
  }

  public equalTo(value: any, key?: keyof T & string) {
    super.equalTo(value, key);
    this.validateKey('equalTo', key, [
      RtdbOrder.orderByChild,
      RtdbOrder.orderByValue,
    ]);
    return this;
  }

  public deserialize(db?: ISimplifiedDatabase): IRealTimeQuery {
    const database = db || this.db;
    let q: IRealTimeQuery = database.ref(this.path);

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

  public async execute(db?: ISimplifiedDatabase): Promise<IRtdbDataSnapshot> {
    const database = db || this.db;
    const snapshot = await this.deserialize(database).once('value');
    return snapshot;
  }

  public where<V>(
    operation: IComparisonOperator,
    value: V,
    key?: keyof T & string
  ) {
    switch (operation) {
      case '=':
        return this.equalTo(value, key);
      case '>':
        return this.startAt(value, key);
      case '<':
        return this.endAt(value, key);
      default:
        const err: any = new Error(`Unknown comparison operator: ${operation}`);
        err.code = 'invalid-operator';
        throw err;
    }
  }

  /**
   * Ensures that when a `key` is passed in as part of the query modifiers --
   * such as "startAt", "endAt", etc. -- that the sorting strategy is valid.
   *
   * @param caller gives a simple string name for the method
   * which is currently being called to modify the search filters
   * @param key the key value that _might_ have been erroneously passed in
   */
  protected validateKey(
    caller: string,
    key: keyof T | undefined,
    allowed: IRtdbOrder[]
  ) {
    const isNotAllowed = allowed.includes(this._orderBy) === false;
    if (key && isNotAllowed) {
      throw new Error(
        `You can not use the "key" parameter with ${caller}() when using a "${
          this._orderBy
        }" sort. Valid ordering strategies are: ${allowed.join(', ')}`
      );
    }
  }
}
