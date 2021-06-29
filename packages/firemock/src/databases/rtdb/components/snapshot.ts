import {
  IMockStore,
  IRtdbDataSnapshot,
  ISdk,
  ISerializedQuery,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';

export type IRtdbMockSnapshotFactory<TSdk extends ISdk, T extends unknown = any> = (
  store: IMockStore<TSdk>,
  key: string,
  value: T[] | T
) => IRtdbDataSnapshot;

export const snapshot: IRtdbMockSnapshotFactory<ISdk> = (store, key, value) => {
  throw new Error("not implemented");
};
