import {
  IDatabaseSdk,
  ISdk,
  isRealTimeDatabase,
  isAdminSdk,
  IModel,
  ISerializedQuery,
  SDK,
} from '@forest-fire/types';
import { SerializedRealTimeQuery, SerializedFirestoreQuery } from './index';

export class SerializedQuery<
  TSdk extends ISdk,
  TModel extends IModel,
  > {
  constructor(db: IDatabaseSdk<TSdk>, path = '/') {
    if (isRealTimeDatabase(db)) {
      return isAdminSdk(db)
        ? new SerializedRealTimeQuery<'RealTimeClient', TModel>(path)
        : new SerializedRealTimeQuery<'RealTimeAdmin', TModel>(path);
    } else {
      return isAdminSdk(db)
        ? new SerializedFirestoreQuery<'FirestoreAdmin', TModel>(path)
        : new SerializedFirestoreQuery<'FirestoreClient', TModel>(path);
    }
  }

  static create<TSdk extends ISdk, TModel extends IModel,>(
    db: IDatabaseSdk<TSdk>,
    path = '/'
  ): ISerializedQuery<TSdk, TModel> {
    if (isRealTimeDatabase(db)) {
      return (isAdminSdk(db)
        ? new SerializedRealTimeQuery<SDK.RealTimeClient, TModel>(path)
        : new SerializedRealTimeQuery<SDK.RealTimeAdmin, TModel>(
          path
        )) as unknown as ISerializedQuery<TSdk, TModel>;
    } else {
      return (isAdminSdk(db)
        ? new SerializedFirestoreQuery<'FirestoreAdmin', TModel>(path)
        : new SerializedFirestoreQuery<'FirestoreClient', TModel>(
          path
        )) as unknown as ISerializedQuery<TSdk, TModel>;
    }
  }
}
