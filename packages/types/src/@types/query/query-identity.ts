import { IModel } from '../firemodel/models';
import { IFirestoreOrder, IRtdbOrder } from './query-order';

export interface ISerializedIdentity<T>
  extends Omit<ISerializedRealTimeIdentity<T>, 'orderBy'> {
  orderBy: IRtdbOrder | IFirestoreOrder;
}

export interface ISerializedRealTimeIdentity<
  T extends IModel = Record<string, unknown> & IModel
  > {
  orderBy: IRtdbOrder;
  orderByKey?: keyof T & string;
  limitToFirst?: number;
  limitToLast?: number;
  startAt?: string | number | boolean;
  startAtKey?: string;
  endAt?: string | number | boolean;
  endAtKey?: keyof T & string;
  equalTo?: string | number | boolean;
  equalToKey?: keyof T & string;
  path: string;
}
