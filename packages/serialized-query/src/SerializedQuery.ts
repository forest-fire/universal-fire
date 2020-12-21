import {
  IDatabase,
  IModel,
  isRealTimeDatabase,
  ISerializedQuery,
  IRealTimeApi,
  IFirestoreApi,
} from '@forest-fire/types';
import { SerializedRealTimeQuery, SerializedFirestoreQuery } from './index';

export class SerializedQuery {
  static create<
    TModel extends IModel = Record<string, unknown> & IModel,
    TDatabase extends IDatabase = IDatabase,
    TQuery extends ISerializedQuery<
      TModel,
      TDatabase
    > = TDatabase extends IRealTimeApi
      ? ISerializedQuery<TModel, IRealTimeApi>
      : ISerializedQuery<TModel, IFirestoreApi>
  >(db: TDatabase, path = '/'): TQuery {
    if (isRealTimeDatabase(db)) {
      return SerializedRealTimeQuery.path<TModel>(path);
    } else {
      return SerializedFirestoreQuery.path<TModel>(path);
    }
  }
}
