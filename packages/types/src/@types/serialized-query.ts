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
export interface ISerializedQuery<T extends IModel = unknown> {
  db: IRtdbDatabase | IFirestoreDatabase;
  path: string;
  identity: ISerializedIdentity<T>;
  setDB: (db: IRtdbDatabase | IFirestoreDatabase) => ISerializedQuery<T>;
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
  deserialize: (
    db: IRtdbDatabase | IFirestoreDatabase
  ) => IFirestoreQuery | IRealTimeQuery;
  execute(db?: IRtdbDatabase | IFirestoreDatabase): Promise<unknown>;
  where: (
    operation: IComparisonOperator,
    value: unknown,
    key?: (keyof T & string) | undefined
  ) => ISerializedQuery<T>;
}

export interface ISerializedIdentity<T>
  extends Omit<ISerializedRealTimeIdentity<T>, 'orderBy'> {
  orderBy: IRtdbOrder | IFirestoreQueryOrderType;
}

export type IComparisonOperator = '=' | '>' | '<';

export enum RtdbOrder {
  orderByChild = 'orderByChild',
  orderByKey = 'orderByKey',
  orderByValue = 'orderByValue',
}

export type IRtdbOrder = keyof typeof RtdbOrder;

export type IFirestoreQueryOrderType = IRtdbOrder | 'orderBy';

export interface ISerializedRealTimeIdentity<T extends IModel = unknown> {
  orderBy: IRtdbOrder;
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
