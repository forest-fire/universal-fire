import { IDatabaseApi, IModel, isRealTimeDatabase } from '@forest-fire/types';
import { SerializedRealTimeQuery, SerializedFirestoreQuery } from './index';

export class SerializedQuery {
  static create<
    TModel extends IModel = Record<string, unknown> & IModel,
    TDatabase extends IDatabaseApi = IDatabaseApi
  >(
    db: TDatabase,
    path = '/'
  ): SerializedRealTimeQuery<TModel> | SerializedFirestoreQuery<TModel> {
    if (isRealTimeDatabase(db)) {
      return SerializedRealTimeQuery.path<TModel>(path);
    } else {
      return SerializedFirestoreQuery.path<TModel>(path);
    }
  }
}
