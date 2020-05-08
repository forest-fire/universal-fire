import type { IDictionary } from 'common-types';

import type {
  IComparisonOperator,
  IFirestoreQuery,
  IFirestoreQueryOrderType,
  ISimplifiedDatabase
} from './index';
import { SerializedQuery } from './index';

/**
 * Provides a way to serialize the full characteristics of a Firebase Firestore
 * Database query.
 */
export class SerializedFirestoreQuery<T = IDictionary> extends SerializedQuery<
  T
> {
  public static path<T extends object = IDictionary>(path: string = '/') {
    return new SerializedFirestoreQuery<T>(path);
  }

  protected _orderBy: IFirestoreQueryOrderType = 'orderBy';
  protected _db?: ISimplifiedDatabase;

  public get db() {
    if (this._db) {
      return this._db;
    }
    throw new Error(
      'Attempt to use SerializedFirestoreQuery without setting database'
    );
  }

  public orderBy(child: keyof T & string) {
    this._orderBy = 'orderBy';
    this._orderKey = child;
    return this;
  }

  public set db(value: ISimplifiedDatabase) {
    this._db = value;
  }

  public deserialize(db?: ISimplifiedDatabase): IFirestoreQuery {
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

  public async execute(db?: ISimplifiedDatabase) {
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
