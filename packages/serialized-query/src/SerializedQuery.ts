import { IDatabase, IModel } from '@forest-fire/types';
import { SerializedRealTimeQuery, SerializedFirestoreQuery } from './index';

export class SerializedQuery {
  static create<
    TModel extends IModel = Record<string, unknown> & IModel,
    TDatabase extends IDatabase = IDatabase,
    TQuery extends IQuery<TModel, TDatabase>
  >(db: TDatabase, path = '/'): TQuery<TModel, TDatabase> {
    if (isRealTimeDatabase(db)) {
      return SerializedRealTimeQuery.path<TModel>(path);
    } else {
      return SerializedFirestoreQuery.path<TModel>(path);
    }
  }
}
