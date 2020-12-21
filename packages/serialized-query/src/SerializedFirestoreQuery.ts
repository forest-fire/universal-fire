/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { slashNotation } from './slashNotation';
import type {
  IComparisonOperator,
  IFirestoreQuerySnapshot,
  ISerializedQuery,
  IFirestoreDatabase,
  IModel,
  ISerializedIdentity,
  IFirestoreOrder,
  IFirestoreApi,
} from '@forest-fire/types';
import { SerializedError } from './SerializedError';

/**
 * Provides a way to serialize the full characteristics of a Firebase Firestore
 * Database query.
 */
export class SerializedFirestoreQuery<
  T extends IModel = Record<string, unknown> & IModel
> implements ISerializedQuery<T, IFirestoreApi> {
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
  protected _db?: IFirestoreDatabase;

  /** Static initializer */
  public static path<T extends IModel>(
    path = '/'
  ): SerializedFirestoreQuery<T> {
    return new SerializedFirestoreQuery<T>(path);
  }

  /**
   * Constructor
   */
  constructor(path = '/') {
    this._path = slashNotation(path);
  }

  protected _orderBy: IFirestoreOrder = 'orderBy';

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

  public get db(): IFirestoreDatabase {
    if (this._db) {
      return this._db;
    }
    throw new Error(
      'Attempt to use SerializedFirestoreQuery without setting database'
    );
  }

  public set db(value: IFirestoreDatabase) {
    this._db = value;
  }

  public get path(): string {
    return this._path;
  }

  public orderBy(child: keyof T & string): SerializedFirestoreQuery<T> {
    this._orderBy = 'orderBy';
    this._orderKey = child;
    return this;
  }

  public limitToFirst(value: number): SerializedFirestoreQuery<T> {
    this._limitToFirst = value;
    return this;
  }

  public limitToLast(value: number): SerializedFirestoreQuery<T> {
    this._limitToLast = value;
    return this;
  }

  public orderByChild(child: keyof T & string): SerializedFirestoreQuery<T> {
    this._orderBy = 'orderByChild';
    this._orderKey = child;
    return this;
  }

  public orderByValue(): SerializedFirestoreQuery<T> {
    this._orderBy = 'orderByValue';
    return this;
  }

  public orderByKey(): SerializedFirestoreQuery<T> {
    this._orderBy = 'orderByKey';
    return this;
  }

  public startAt(
    value: string | number | boolean,
    key?: keyof T & string
  ): SerializedFirestoreQuery<T> {
    this._startAt = value;
    this._startAtKey = key;
    return this;
  }

  public endAt(
    value: string | number | boolean,
    key?: keyof T & string
  ): SerializedFirestoreQuery<T> {
    this._endAt = value;
    this._endAtKey = key;
    return this;
  }

  public equalTo(
    value: string | number | boolean,
    key?: keyof T & string
  ): SerializedFirestoreQuery<T> {
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

  public deserialize(db?: IFirestoreDatabase): IFirestoreQuery {
    const database = db || this.db;
    // TODO: resolve this typing!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = database.collection(this.path);

    switch (this.identity.orderBy) {
      case 'orderByKey':
        console.warn(
          `DEPRECATION: orderByKey sort is not supported in Firestore [${this.path}]`
        );
        break;
      case 'orderByValue':
        console.warn(
          `DEPRECATION: orderByValue sort is not supported in Firestore [${this.path}]`
        );
        break;
      case 'orderByChild':
      case 'orderBy':
        q = q.orderBy(this.identity.orderByKey as string);
        break;
    }

    if (this.identity.limitToFirst) {
      q.limit(this.identity.limitToFirst);
    }
    if (this.identity.limitToLast) {
      q = q.limitToLast(this.identity.limitToLast);
    }
    if (this.identity.startAt) {
      q = q.where(this.path, '>', this.identity.startAt);
    }
    if (this.identity.endAt) {
      q = q.where(this.path, '<', this.identity.endAt);
    }
    if (this.identity.equalTo) {
      q = q.where(this.path, '==', this.identity.equalTo);
    }

    // TODO: remove this!
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return q;
  }

  public async execute(
    db?: IFirestoreDatabase
  ): Promise<IFirestoreQuerySnapshot> {
    const database = db || this.db;
    const snapshot = await this.deserialize(database).get();
    return snapshot;
  }

  public where(
    operation: IComparisonOperator,
    value: string | number | boolean,
    key?: keyof T & string
  ): SerializedFirestoreQuery<T> {
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

  /**
   * Allows the DB interface to be setup early, allowing clients
   * to call execute without any params.
   */
  public setDB(db: IFirestoreDatabase): SerializedFirestoreQuery<T> {
    this._db = db;
    return this;
  }

  public setPath(path: string): SerializedFirestoreQuery<T> {
    this._path = slashNotation(path);
    return this;
  }

  public toJSON(): ISerializedIdentity<T> {
    return this.identity;
  }

  public toString(): string {
    return JSON.stringify(this.identity, null, 2);
  }
}
