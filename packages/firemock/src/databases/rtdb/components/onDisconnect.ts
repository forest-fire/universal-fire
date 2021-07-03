import {
  IMockStore,
  IRtdbOnDisconnect,
  ISdk,
  ISerializedQuery,
} from '@forest-fire/types';

export function onDisconnect<
  TStore extends IMockStore<TSdk>,
  TSdk extends ISdk
>(store: TStore, query: ISerializedQuery<TSdk>) {
  const disconnect: IRtdbOnDisconnect = {
    cancel: async (_cb) => {
      return Promise.resolve();
    },
    remove: async (_cb) => {
      return Promise.resolve();
    },
    set: async (_cb) => {
      return Promise.resolve();
    },
    setWithPriority: async (_cb) => {
      return Promise.resolve();
    },
    update: async (_cb) => {
      return Promise.resolve();
    },
  };

  return disconnect;
}
