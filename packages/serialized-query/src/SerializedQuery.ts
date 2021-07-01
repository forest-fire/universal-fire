
import {
  IDatabaseSdk,
  ISdk,
  IGenericModel,
  isRealTimeDatabase,
  isAdminSdk,
} from '@forest-fire/types';
import { SerializedRealTimeQuery, SerializedFirestoreQuery } from './index';

export class SerializedQuery<TModel extends IGenericModel, TDatabase extends IDatabaseSdk<TSdk>, TSdk extends ISdk> {

  constructor(db: TDatabase, path = "/") {
    if (isRealTimeDatabase(db)) {
      return isAdminSdk(db)
        ? new SerializedRealTimeQuery<"RealTimeClient", TModel>(path)
        : new SerializedRealTimeQuery<"RealTimeAdmin", TModel>(path);
    } else {
      return isAdminSdk(db)
        ? new SerializedFirestoreQuery<"FirestoreAdmin", TModel>(path)
        : new SerializedFirestoreQuery<"FirestoreClient", TModel>(path)
    }
  }

  // static create<TModel extends IModel = IGenericModel, TSdk extends IDatabaseSdk<TSdk, TDb>, TSdk extends ISdk, TDb extends IDb>(
  //   db: TSdk,
  //   path = '/'
  // ): SerializedRealTimeQuery<TModel> | SerializedFirestoreQuery<TModel> {
  //   if (isRealTimeDatabase(db)) {
  //     return SerializedRealTimeQuery.path<TModel>(path);
  //   } else {
  //     return SerializedFirestoreQuery.path<TModel>(path);
  //   }
  // }
}
