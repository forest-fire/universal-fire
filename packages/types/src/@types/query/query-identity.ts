;
import { IRtdbSdk, ISdk } from '../fire-types';
import { IFirestoreOrder, IRtdbOrder } from './query-order';
export interface ISerializedIdentity<TSdk extends ISdk, TData extends unknown> {
  endAtKey: string & keyof TData;
  endAt: string | number | boolean;
  equalToKey: string & keyof TData;
  equalTo: string | number | boolean;
  limitToFirst: number;
  limitToLast: number;
  orderByKey: string;
  orderBy: OrderFrom<TSdk>;
  path: string;
  startAt: string | number | boolean;
  startAtKey: string & keyof TData;
}

export type OrderFrom<T extends ISdk> = T extends IRtdbSdk ? IRtdbOrder : IFirestoreOrder;