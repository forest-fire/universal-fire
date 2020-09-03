import {
  IMockStore,
  IRtdbDataSnapshot,
  ISerializedQuery,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';

export type IRtdbMockSnapshotFactory = (
  store: IMockStore<IDictionary>,
  query: ISerializedQuery
) => IRtdbDataSnapshot;

export const snapshot: IRtdbMockSnapshotFactory = (store, query) => {
  return {};
};
