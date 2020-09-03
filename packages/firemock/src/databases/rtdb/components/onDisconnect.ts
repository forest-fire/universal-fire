import {
  IMockStore,
  IRtdbOnDisconnect,
  ISerializedQuery,
} from '@forest-fire/types';

import { IDictionary } from 'common-types';

export type IRtdbMockOnDisconnectFactory = (
  store: IMockStore<IDictionary>,
  query: ISerializedQuery
) => IRtdbOnDisconnect;

export const onDisconnect: IRtdbMockOnDisconnectFactory = (store, query) => {
  const disconnect: IRtdbOnDisconnect = {
    cancel: async (cb) => {
      //
    },
    remove: async (cb) => {
      //
    },
    set: async (cb) => {
      //
    },
    setWithPriority: async (cb) => {
      //
    },
    update: async (cb) => {
      //
    },
  };

  return disconnect;
};
