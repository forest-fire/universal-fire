import { IMockStore, IClientRtdbDatabase } from '@forest-fire/types';
import { url } from 'common-types';

import { IDictionary } from 'native-dash';
import { reference } from '../index';
import { createClientApp } from '../../firebase-app';

/**
 * Creates a mock Admin SDK for the RTDB which is able
 * to interact with the mock store
 */
export type MockClientFactory = (
  store: IMockStore<IDictionary>
) => IClientRtdbDatabase;

export const createRtdbClientMock: MockClientFactory = (store) => {
  const db: IClientRtdbDatabase = {
    app: createClientApp(store),
    ref: () => {
      return reference(store, null);
    },
    refFromURL(url: url) {
      return reference(store, url);
    },
    goOffline() {},
    goOnline() {},
  };

  return db;
};
