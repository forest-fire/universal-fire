import { IFirestoreQuery, IRealTimeQuery } from './fire-proxies';
import { IDictionary } from 'common-types';

/**
 * Defines the public interface which any serializer must
 * conform to to be recognized as a Serialized Query in
 * `universal-fire`.
 *
 * NOTE: in `0.60.x` onward this fully replaces the class inheritance
 * off of **BaseSerializer** as this was problematic and we are trying
 * to move away from classes's providing interfaces implicitly
 */
export interface ISerializedQuery<T = unknown> {
  db: ISimplifiedDatabase;
  path: string;
  identity: ISerializedIdentity<T>;
  setDB: (db: ISimplifiedDatabase) => ISerializedQuery<T>;
  setPath: (path: string) => ISerializedQuery<T>;
  hashCode: () => number;
  limitToFirst: (value: number) => ISerializedQuery<T>;
  limitToLast: (value: number) => ISerializedQuery<T>;
  orderByChild: (child: keyof T & string) => ISerializedQuery<T>;
  orderByValue: () => ISerializedQuery<T>;
  orderByKey: () => ISerializedQuery<T>;
  startAt: (value: unknown, key?: keyof T & string) => ISerializedQuery<T>;
  endAt: (value: unknown, key?: keyof T & string) => ISerializedQuery<T>;
  equalTo: (value: unknown, key?: keyof T & string) => ISerializedQuery<T>;
  toJSON: () => ISerializedIdentity<T>;
  toString: () => string;
  deserialize: (db: ISimplifiedDatabase) => IFirestoreQuery | IRealTimeQuery;
  execute(db?: ISimplifiedDatabase): Promise<unknown>;
  where: (
    operation: IComparisonOperator,
    value: unknown,
    key?: (keyof T & string) | undefined
  ) => ISerializedQuery<T>;
}

export interface ISerializedIdentity<T>
  extends Omit<ISerializedRealTimeIdentity<T>, 'orderBy'> {
  orderBy: IRealQueryOrderType | IFirestoreQueryOrderType;
}

export type IComparisonOperator = '=' | '>' | '<';

/**
 * Lowest-common-denominator for a database definition, typically should
 * be either a `IRealTimeQuery` or `IFirestoreQuery`. You can use the
 * `isRealTimeQuery()` and `isFirestoreQuery()` type gaurds to test and
 * get strong typing.
 */
export interface ISimplifiedDatabase {
  ref: (
    path: string
  ) => Record<string, unknown> | IRealTimeQuery | IFirestoreQuery;
}

export enum RealQueryOrderType {
  orderByChild = 'orderByChild',
  orderByKey = 'orderByKey',
  orderByValue = 'orderByValue',
}

export type IRealQueryOrderType = keyof typeof RealQueryOrderType;

export type IFirestoreQueryOrderType = IRealQueryOrderType | 'orderBy';

export interface ISerializedRealTimeIdentity<T = IDictionary> {
  orderBy: IRealQueryOrderType;
  orderByKey?: keyof T;
  limitToFirst?: number;
  limitToLast?: number;
  startAt?: string;
  startAtKey?: string;
  endAt?: string;
  endAtKey?: string;
  equalTo?: string;
  equalToKey?: string;
  path: string;
}
