import {
  IDatabaseApi,
  IGenericModel,
  IModel,
  isRealTimeDatabase,
} from '@forest-fire/types';
import { SerializedRealTimeQuery, SerializedFirestoreQuery } from './index';

export class SerializedQuery {
  static create<
    TModel extends IModel = IGenericModel,
    TApi extends IDatabaseApi = IDatabaseApi
  >(
    db: TApi,
    path = '/'
  ): SerializedRealTimeQuery<TModel> | SerializedFirestoreQuery<TModel> {
    if (isRealTimeDatabase(db)) {
      return SerializedRealTimeQuery.path<TModel>(path);
    } else {
      return SerializedFirestoreQuery.path<TModel>(path);
    }
  }
}
