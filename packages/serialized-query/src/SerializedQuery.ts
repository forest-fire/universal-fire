import {
  IDatabaseSdk,
  ISdk,
  isRealTimeDatabase,
  isAdminSdk,
  ISerializedQuery,
  SDK,
} from '@forest-fire/types';
import { SerializedRealTimeQuery, SerializedFirestoreQuery } from './index';

export class SerializedQuery<
  TSdk extends ISdk,
  TData extends unknown = Record<string, unknown>,
  > {
  constructor(db: IDatabaseSdk<TSdk>, path = '/') {
    if (isRealTimeDatabase(db)) {
      return isAdminSdk(db)
        ? new SerializedRealTimeQuery<'RealTimeClient', TData>(path)
        : new SerializedRealTimeQuery<'RealTimeAdmin', TData>(path);
    } else {
      return isAdminSdk(db)
        ? new SerializedFirestoreQuery<'FirestoreAdmin', TData>(path)
        : new SerializedFirestoreQuery<'FirestoreClient', TData>(path);
    }
  }

  static create<TSdk extends ISdk = ISdk, TData extends unknown = Record<string, unknown>>(
    db: IDatabaseSdk<TSdk>,
    path = '/'
  ): ISerializedQuery<TSdk, TData> {
    if (isRealTimeDatabase(db)) {
      return (isAdminSdk(db)
        ? new SerializedRealTimeQuery<SDK.RealTimeClient, TData>(path)
        : new SerializedRealTimeQuery<SDK.RealTimeAdmin, TData>(
          path
        )) as unknown as ISerializedQuery<TSdk, TData>;
    } else {
      return (isAdminSdk(db)
        ? new SerializedFirestoreQuery<'FirestoreAdmin', TData>(path)
        : new SerializedFirestoreQuery<'FirestoreClient', TData>(
          path
        )) as unknown as ISerializedQuery<TSdk, TData>;
    }
  }
}
