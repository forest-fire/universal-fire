import {
  IMockStore,
  IRtdbOnDisconnect,
  ISerializedQuery,
} from '@forest-fire/types';



export const onDisconnect = <TStore extends IMockStore<TSdk>, TSdk extends ISdk,>(store: TStore, query: ISerializedQuery<TSdk>) => {
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
