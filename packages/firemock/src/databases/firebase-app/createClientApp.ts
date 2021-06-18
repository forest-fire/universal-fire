import { IClientApp, IMockStore, ISdk } from '@forest-fire/types';


export const createClientApp = <T extends IMockStore<TSdk>, TSdk extends ISdk>(store: T): IClientApp => ({
  name: store.config.name,
  options: {},
  automaticDataCollectionEnabled: false,
  delete: async () => { },
});
