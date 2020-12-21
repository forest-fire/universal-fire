import { IDatabase } from '../database/db-api-base';
import {
  IModel,
  IRtdbDatabase,
  IComparisonOperator,
  IFirebaseFirestoreQuery,
  IFirebaseRtdbQuery,
  ISerializedIdentity,
} from '../index';

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
  TDatabase extends IDatabase = IDatabase,
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
  deserialize: <
    TDb = TDatabase,
    TQuery = TDb extends IRtdbDatabase
      ? IFirebaseRtdbQuery
      : IFirebaseFirestoreQuery
  >(
    db: TDb
  ) => TQuery;
  execute<T = unknown>(db?: TDatabase): Promise<T>;
}
