import {
  IMockStore,
  IAdminRtdbDatabase,
  IRtdbReference,
} from '@forest-fire/types';
import { url } from 'common-types';

import { IDictionary } from 'native-dash';
import { createAdminApp } from '../../firebase-app';
import { reference, Reference } from '../components/Reference';

/**
 * Creates a mock Admin SDK for the RTDB which is able
 * to interact with the mock store
 */
export type MockAdminFactory = (
  store: IMockStore<IDictionary>
) => IAdminRtdbDatabase;

export const createAdminMock: MockAdminFactory = (store) => {
  const db: IAdminRtdbDatabase = {
    app: createAdminApp(store),
    ref(path = null) {
      return reference(store, path);
    },
    async refFromURL(url: url) {
      return new Reference(url, this._store);
    },
    async getRules() {},
    async getRulesJSON() {},
    goOffline() {},
    goOnline() {},
    async setRules() {},
  };

  return db;
};
