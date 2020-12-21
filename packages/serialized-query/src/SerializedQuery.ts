import { IAbstractedDatabase, IModel } from '@forest-fire/types';
import { SerializedRealTimeQuery, SerializedFirestoreQuery } from '.';

export class SerializedQuery {
  static create<T extends IModel = Record<string, unknown> & IModel>(
    db: IAbstractedDatabase,
    path = '/'
  ): SerializedFirestoreQuery | SerializedRealTimeQuery {
    if (['RealTimeClient', 'RealTimeAdmin', 'RealTimeDb'].includes(db.sdk)) {
      return SerializedRealTimeQuery.path<T>(path);
    } else {
      return SerializedFirestoreQuery.path<T>(path);
    }
  }
}
