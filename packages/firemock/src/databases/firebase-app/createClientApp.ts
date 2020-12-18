import { IClientApp, IMockStore } from '@forest-fire/types';
import { IDictionary } from 'common-types';

export type FirebaseClientMockAppFactory = (
  store: IMockStore<IDictionary>
) => IClientApp;

export const createClientApp: FirebaseClientMockAppFactory = (store) => ({
  name: store.config.name,
  options: {},
  automaticDataCollectionEnabled: false,
  delete: async () => {},
});
