import { IDatabase, IRealTimeApi } from '../database';
import { IDatabaseApi } from '../database/db-api-base';
import { IFirestoreDatabase, IRtdbDatabase } from '../fire-proxies';
import {
  IModel,
  IComparisonOperator,
  IFirebaseFirestoreQuery,
  IFirebaseRtdbQuery,
  ISerializedIdentity,
} from '../index';
import { IGenericModel } from '../models';
import { IRtdbSnapshot } from '../proxy-plus';
import { IFirestoreQuerySnapshot } from '../snapshot';

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
  TModel extends IModel = IGenericModel,
  /** the type of database it is being serialized down to */
  TApi extends IDatabaseApi = IDatabaseApi,
  TDb extends IDatabase = TApi extends IRealTimeApi
    ? IRtdbDatabase
    : IFirestoreDatabase,
  K = keyof TModel & string
> {
  db: TDb;
  path: string;
  identity: ISerializedIdentity<TModel>;
  setDB: (db: TDb) => ISerializedQuery<TModel, TApi>;
  setPath: (path: string) => ISerializedQuery<TModel, TApi>;
  hashCode: () => number;
  limitToFirst: (value: number) => ISerializedQuery<TModel, TApi>;
  limitToLast: (value: number) => ISerializedQuery<TModel, TApi>;
  orderByChild: (child: K) => ISerializedQuery<TModel, TApi>;
  orderByValue: () => ISerializedQuery<TModel, TApi>;
  orderByKey: () => ISerializedQuery<TModel, TApi>;
  startAt: (
    value: string | number | boolean,
    key?: keyof TModel & string
  ) => ISerializedQuery<TModel, TApi>;
  endAt: (
    value: string | number | boolean,
    key?: keyof TModel & string
  ) => ISerializedQuery<TModel, TApi>;
  /** Equality comparison */
  equalTo: (
    value: string | number | boolean,
    key?: keyof TModel & string
  ) => ISerializedQuery<TModel, TApi>;
  /**
   * Use the familiar "where" logical construct to build a query.
   * The _property_ being operated on is determined by which
   * ordering you choose but typically is "orderByChild".
   */
  where: (
    operation: IComparisonOperator,
    value: unknown,
    key?: (keyof TModel & string) | undefined
  ) => ISerializedQuery<TModel, TApi>;

  toJSON: () => ISerializedIdentity<TModel>;
  toString: () => string;

  /**
   * Deserialize a `SerializedQuery` into a specific DB's query type:
   * {@link @firebase/firestore-types/Query} or {@link @firebase/database-types/Query}.
   */
  deserialize: <
    TQuery = TDb extends IRtdbDatabase
      ? IFirebaseRtdbQuery
      : TDb extends IFirestoreDatabase
      ? IFirebaseFirestoreQuery
      : unknown
  >(
    db: TDb
  ) => TQuery;

  execute<
    TSnap = TDb extends IRtdbDatabase ? IRtdbSnapshot : IFirestoreQuerySnapshot
  >(
    db?: TDb
  ): Promise<TSnap>;
}
