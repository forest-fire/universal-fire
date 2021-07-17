import {
  IDatabaseSdk,
  ISdk,
  isRealTimeDatabase,
  isAdminSdk,
  IModel,
  ISerializedQuery,
  SDK,
  IRtdbSdk,
} from '@forest-fire/types';
import { SerializedRealTimeQuery, SerializedFirestoreQuery } from './index';

export class SerializedQuery<
  TModel extends IModel | Record<string, unknown>,
  TSdk extends ISdk
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

  static create<TModel extends IModel, TSdk extends ISdk>(
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
