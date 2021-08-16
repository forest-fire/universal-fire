/* eslint-disable @typescript-eslint/ban-types */
import {
  DbFrom,
  DeserializedQueryFrom,
  SnapshotFrom,
} from '../database/db-util';
import { ISdk } from '../fire-types';
import { IComparisonOperator, ISerializedIdentity } from '../index';

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
  TSdk extends ISdk,
  /** the data model being serialized */
  TData extends unknown = Record<string, unknown>
  > {
  get db(): DbFrom<TSdk>;
  set db(value: DbFrom<TSdk>);
  get path(): string;
  get identity(): ISerializedIdentity<TSdk, TData>;
  setDB: (db: DbFrom<TSdk>) => ISerializedQuery<TSdk, TData>;
  setPath: (path: string) => ISerializedQuery<TSdk, TData>;
  hashCode: () => number;
  limitToFirst: (value: number) => ISerializedQuery<TSdk, TData>;
  limitToLast: (value: number) => ISerializedQuery<TSdk, TData>;
  orderByChild: (child: keyof TData) => ISerializedQuery<TSdk, TData>;
  orderByValue: () => ISerializedQuery<TSdk, TData>;
  orderByKey: () => ISerializedQuery<TSdk, TData>;
  startAt: (
    value: string | number | boolean,
    key?: keyof TData & string
  ) => ISerializedQuery<TSdk, TData>;
  endAt: (
    value: string | number | boolean,
    key?: keyof TData & string
  ) => ISerializedQuery<TSdk, TData>;
  /** Equality comparison */
  equalTo: (
    value: string | number | boolean,
    key?: keyof TData & string
  ) => ISerializedQuery<TSdk, TData>;
  /**
   * Use the familiar "where" logical construct to build a query.
   * The _property_ being operated on is determined by which
   * ordering you choose but typically is "orderByChild".
   */
  where: (
    operation: IComparisonOperator,
    value: unknown,
    key?: (keyof TData & string) | undefined
  ) => ISerializedQuery<TSdk, TData>;

  toJSON: () => ISerializedIdentity<TSdk, TData>;
  toString: () => string;

  /**
   * Deserialize a `SerializedQuery` into a specific DB's query type:
   * {@link @firebase/firestore-types/Query} or {@link @firebase/database-types/Query}.
   */
  deserialize: (db?: DbFrom<TSdk>) => DeserializedQueryFrom<TSdk>;

  execute: (db?: DbFrom<TSdk>) => Promise<SnapshotFrom<TSdk>>;
}
