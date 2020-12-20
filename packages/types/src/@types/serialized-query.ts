import { IModel, IRtdbDatabase } from '../index';
import {
  IFirestoreDatabase,
  IFirestoreQuery,
  IRealTimeQuery,
} from './fire-proxies';

/**
 * Defines the public interface which any serializer must
 * conform to to be recognized as a Serialized Query in
 * `universal-fire`.
 *
 * NOTE: in `0.60.x` onward this fully replaces the class inheritance
 * off of **BaseSerializer** as this was problematic and we are trying
 * to move away from classes's providing interfaces implicitly
 */
export interface ISerializedQuery<
  /** the data model being serialized */
  TModel extends IModel = unknown,
  /** the type of database it is being serialized down to */
  TDatabase extends IRtdbDatabase | IFirestoreDatabase = IRtdbDatabase,
  K = keyof TModel & string
> {
  db: TDatabase;
  path: string;
  identity: ISerializedIdentity<TModel>;
  setDB: (db: TDatabase) => ISerializedQuery<TModel, TDatabase>;
  setPath: (path: string) => ISerializedQuery<TModel, TDatabase>;
  hashCode: () => number;
  limitToFirst: (value: number) => ISerializedQuery<TModel, TDatabase>;
  limitToLast: (value: number) => ISerializedQuery<TModel, TDatabase>;
  orderByChild: (child: K) => ISerializedQuery<TModel, TDatabase>;
  orderByValue: () => ISerializedQuery<TModel, TDatabase>;
  orderByKey: () => ISerializedQuery<TModel, TDatabase>;
  startAt: (
    value: string | number | boolean,
    key?: keyof TModel & string
  ) => ISerializedQuery<TModel, TDatabase>;
  endAt: (
    value: string | number | boolean,
    key?: keyof TModel & string
  ) => ISerializedQuery<TModel, TDatabase>;
  equalTo: (
    value: string | number | boolean,
    key?: keyof TModel & string
  ) => ISerializedQuery<TModel, TDatabase>;
  /**
   * Use the familiar "where" logical construct to build a query.
   * The _property_ being operated on is determined by which
   * ordering you choose but typically is "orderByChild".
   */
  where: (
    operation: IComparisonOperator,
    value: unknown,
    key?: (keyof TModel & string) | undefined
  ) => ISerializedQuery<TModel, TDatabase>;

  toJSON: () => ISerializedIdentity<TModel>;
  toString: () => string;
  /**
   * Deserialize a `SerializedQuery` into a specific DB's query type:
   * {@link @firebase/firestore-types/Query} or {@link @firebase/database-types/Query}.
   */
  deserialize: (db: TDatabase) => IFirestoreQuery | IRealTimeQuery;
  execute(db?: TDatabase): Promise<unknown>;
}

export interface ISerializedIdentity<T>
  extends Omit<ISerializedRealTimeIdentity<T>, 'orderBy'> {
  orderBy: IRtdbOrder | IFirestoreOrder;
}

export type IComparisonOperator = '=' | '>' | '<';

export enum RtdbOrder {
  orderByChild = 'orderByChild',
  orderByKey = 'orderByKey',
  orderByValue = 'orderByValue',
}

export type IRtdbOrder = keyof typeof RtdbOrder;

export type IFirestoreOrder = IRtdbOrder | 'orderBy';

export interface ISerializedRealTimeIdentity<T extends IModel = unknown> {
  orderBy: IRtdbOrder;
  orderByKey?: keyof T & string;
  limitToFirst?: number;
  limitToLast?: number;
  startAt?: string | number | boolean;
  startAtKey?: string;
  endAt?: string | number | boolean;
  endAtKey?: keyof T & string;
  equalTo?: string | number | boolean;
  equalToKey?: keyof T & string;
  path: string;
}
