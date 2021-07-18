/* eslint-disable @typescript-eslint/ban-types */
import {
  DbFrom,
  DeserializedQueryFrom,
  SnapshotFrom,
} from '../database/db-util';
import { ISdk } from '../fire-types';
import { IModel, IComparisonOperator, ISerializedIdentity } from '../index';

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
  TModel extends IModel = {}
  > {
  db: DbFrom<TSdk>;
  path: string;
  identity: ISerializedIdentity<TModel>;
  setDB: (db: DbFrom<TSdk>) => ISerializedQuery<TSdk, TModel>;
  setPath: (path: string) => ISerializedQuery<TSdk, TModel>;
  hashCode: () => number;
  limitToFirst: (value: number) => ISerializedQuery<TSdk, TModel>;
  limitToLast: (value: number) => ISerializedQuery<TSdk, TModel>;
  orderByChild: (child: keyof TModel) => ISerializedQuery<TSdk, TModel>;
  orderByValue: () => ISerializedQuery<TSdk, TModel>;
  orderByKey: () => ISerializedQuery<TSdk, TModel>;
  startAt: (
    value: string | number | boolean,
    key?: keyof TModel & string
  ) => ISerializedQuery<TSdk, TModel>;
  endAt: (
    value: string | number | boolean,
    key?: keyof TModel & string
  ) => ISerializedQuery<TSdk, TModel>;
  /** Equality comparison */
  equalTo: (
    value: string | number | boolean,
    key?: keyof TModel & string
  ) => ISerializedQuery<TSdk, TModel>;
  /**
   * Use the familiar "where" logical construct to build a query.
   * The _property_ being operated on is determined by which
   * ordering you choose but typically is "orderByChild".
   */
  where: (
    operation: IComparisonOperator,
    value: unknown,
    key?: (keyof TModel & string) | undefined
  ) => ISerializedQuery<TSdk, TModel>;

  toJSON: () => ISerializedIdentity<TModel>;
  toString: () => string;

  /**
   * Deserialize a `SerializedQuery` into a specific DB's query type:
   * {@link @firebase/firestore-types/Query} or {@link @firebase/database-types/Query}.
   */
  deserialize: (db?: DbFrom<TSdk>) => DeserializedQueryFrom<TSdk>;

  execute: (db?: DbFrom<TSdk>) => Promise<SnapshotFrom<TSdk>>;
}
