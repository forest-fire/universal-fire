/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  IGenericModel,
  DbFrom,
  IFirebaseCollectionReference,
  SnapshotFrom,
  DeserializedQueryFrom
} from '@forest-fire/types';
import { SerializedError } from './SerializedError';

/**
 * Provides a way to serialize the full characteristics of a Firebase Firestore
 * Database query.
 */
export class SerializedFirestoreQuery<
  TSdk extends "FirestoreAdmin" | "FirestoreClient",
  M extends IModel = IGenericModel
  >
  implements ISerializedQuery<TSdk, M> {
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
  protected _db?: DbFrom<TSdk>;

  /** Static initializer */
  // public static path<T extends IModel>(
  //   path = '/'
  // ): SerializedFirestoreQuery<T> {
  //   return new SerializedFirestoreQuery<TSdk, M>(path);
  // }

  /**
   * Constructor
   */
  constructor(path = '/') {
    this._path = slashNotation(path);
  }

  protected _orderBy: IFirestoreOrder = 'orderBy';

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

  public get db(): DbFrom<TSdk> {
    if (this._db) {
      return this._db;
    }
    throw new Error(
      'Attempt to use SerializedFirestoreQuery without setting database'
    );
  }

  public set db(value: DbFrom<TSdk>) {
    this._db = value;
  }

  public get path(): string {
    return this._path;
  }

  public orderBy(child: keyof M & string): SerializedFirestoreQuery<TSdk, M> {
    this._orderBy = 'orderBy';
    this._orderKey = child;
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public limitToFirst(value: number): SerializedFirestoreQuery<TSdk, M> {
    this._limitToFirst = value;
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public limitToLast(value: number): SerializedFirestoreQuery<TSdk, M> {
    this._limitToLast = value;
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public orderByChild(child: keyof M & string): SerializedFirestoreQuery<TSdk, M> {
    this._orderBy = 'orderByChild';
    this._orderKey = child;
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public orderByValue(): SerializedFirestoreQuery<TSdk, M> {
    this._orderBy = 'orderByValue';
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public orderByKey(): SerializedFirestoreQuery<TSdk, M> {
    this._orderBy = 'orderByKey';
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public startAt(
    value: string | number | boolean,
    key?: keyof M & string
  ): SerializedFirestoreQuery<TSdk, M> {
    this._startAt = value;
    this._startAtKey = key;
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public endAt(
    value: string | number | boolean,
    key?: keyof M & string
  ): SerializedFirestoreQuery<TSdk, M> {
    this._endAt = value;
    this._endAtKey = key;
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public equalTo(
    value: string | number | boolean,
    key?: keyof M & string
  ): SerializedFirestoreQuery<TSdk, M> {
    this._equalTo = value;
    this._equalToKey = key;
    return this as SerializedFirestoreQuery<TSdk, M>;
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
    const q = database.collection(this.path);

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
        q.orderBy(this.identity.orderByKey as string);
        break;
    }

    if (this.identity.limitToFirst) {
      q.limit(this.identity.limitToFirst);
    }
    if (this.identity.limitToLast) {
      q.limitToLast(this.identity.limitToLast);
    }
    if (this.identity.startAt) {
      q.where(this.path, '>', this.identity.startAt);
    }
    if (this.identity.endAt) {
      q.where(this.path, '<', this.identity.endAt);
    }
    if (this.identity.equalTo) {
      q.where(this.path, '==', this.identity.equalTo);
    }

    return q as DeserializedQueryFrom<TSdk>;
  }

  public async execute(
    db?: DbFrom<TSdk>
  ): Promise<SnapshotFrom<TSdk>> {
    const database = db || this.db;
    const value = (await (this.deserialize(
      database
    ).get() as unknown)) as SnapshotFrom<TSdk>;
    return value;
  }

  public where(
    operation: IComparisonOperator,
    value: string | number | boolean,
    key?: keyof M & string
  ): SerializedFirestoreQuery<TSdk, M> {
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
          'firestore/invalid-operator'
        );
    }
  }

  /**
   * Allows the DB interface to be setup early, allowing clients
   * to call execute without any params.
   */
  public setDB(db: DbFrom<TSdk>): SerializedFirestoreQuery<TSdk, M> {
    this._db = db;
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public setPath(path: string): SerializedFirestoreQuery<TSdk, M> {
    this._path = slashNotation(path);
    return this as SerializedFirestoreQuery<TSdk, M>;
  }

  public toJSON(): ISerializedIdentity<M> {
    return this.identity;
  }

  public toString(): string {
    return JSON.stringify(this.identity, null, 2);
  }
}
