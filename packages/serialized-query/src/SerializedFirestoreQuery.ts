import { slashNotation } from './slashNotation';
import type {
  IComparisonOperator,
  IFirestoreQuery,
  IFirestoreQueryOrderType,
  IFirestoreQuerySnapshot,
  ISerializedQuery,
  IFirestoreDatabase,
  IModel,
  ISerializedIdentity,
} from '@forest-fire/types';

/**
 * Provides a way to serialize the full characteristics of a Firebase Firestore
 * Database query.
 */
export class SerializedFirestoreQuery<T extends IModel>
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

  protected _orderBy: IFirestoreQueryOrderType = 'orderBy';

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

  public orderBy(child: keyof T & string): SerializedFirestoreQuery<T> {
    this._orderBy = 'orderBy';
    this._orderKey = child;
    return this;
  }

  public deserialize(db?: IFirestoreDatabase): IFirestoreQuery {
    const database = db || this.db;
    let q: IFirestoreQuery = database.ref(this.path);

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
    return q;
  }

  public async execute(
    db?: IFirestoreDatabase
  ): Promise<IFirestoreQuerySnapshot> {
    const database = db || this.db;
    const snapshot = await this.deserialize(database).get();
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
}
