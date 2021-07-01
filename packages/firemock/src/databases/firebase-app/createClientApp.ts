import { IClientApp, IMockStore, ISdk } from '@forest-fire/types';

export function createClientApp<T extends IMockStore<TSdk>, TSdk extends ISdk>(
  store: T
): IClientApp {
  return {
    name: store.config.name,
    options: {},
    automaticDataCollectionEnabled: false,
    // TODO:
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    delete: async () => {},
  };
}
