import {
  SerializedFirestoreQuery,
  SerializedRealTimeQuery,
} from '@forest-fire/serialized-query';

import { IDictionary } from 'common-types';

export interface ISimplifiedDb extends IDictionary {
  constructor: {
    name: string;
  };
}

export class SerializedQuery {
  static create<T = IDictionary>(db: ISimplifiedDb, path: string = '/') {
    const name = db.constructor.name;
    if (['RealTimeClient', 'RealTimeAdmin', 'RealTimeDb'].includes(name)) {
      return SerializedRealTimeQuery.path<T>(path);
    } else {
      return SerializedFirestoreQuery.path<T>(path);
    }
  }
}
