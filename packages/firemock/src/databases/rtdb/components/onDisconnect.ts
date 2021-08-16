import {
  IMockStore,
  IRtdbOnDisconnect,
  ISdk,
  ISerializedQuery,
} from '@forest-fire/types';

export function onDisconnect<
  TStore extends IMockStore<TSdk, any>,
  TSdk extends ISdk
>(_store: TStore, _query: ISerializedQuery<TSdk>): IRtdbOnDisconnect {
  const disconnect: IRtdbOnDisconnect = {
    cancel: async () => {
      return Promise.resolve();
    },
    remove: async () => {
      return Promise.resolve();
    },
    set: async () => {
      return Promise.resolve();
    },
    setWithPriority: async () => {
      return Promise.resolve();
    },
    update: async () => {
      return Promise.resolve();
    },
  };

  return disconnect;
}
