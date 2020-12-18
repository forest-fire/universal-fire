import {
  IMockStore,
  IAdminRtdbDatabase,
  IRtdbAdminReference,
} from '@forest-fire/types';
import { url } from 'common-types';

import { IDictionary } from 'native-dash';
import { reference } from '..';
import { createAdminApp } from '../../firebase-app';

/**
 * Creates a mock Admin SDK for the RTDB which is able
 * to interact with the mock store
 */
export type MockAdminFactory = (
  store: IMockStore<IDictionary>
) => IAdminRtdbDatabase;

export const createRtdbAdminMock: MockAdminFactory = (store) => {
  const db: IAdminRtdbDatabase = {
    app: createAdminApp(store),
    ref() {
      return reference(store, null) as IRtdbAdminReference;
    },
    refFromURL(url: url) {
      return reference(store, null) as IRtdbAdminReference;
    },
    async getRules() {
      return JSON.stringify(store.rules);
    },
    async getRulesJSON() {
      return store.rules;
    },
    goOffline() {},
    goOnline() {},
    async setRules() {},
  };

  return db;
};
