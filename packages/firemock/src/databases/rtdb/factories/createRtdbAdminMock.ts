import {
  IMockStore,
  IRtdbAdminReference,
  DbFrom,
} from '@forest-fire/types';
import { url } from 'common-types';

import { reference } from '..';
import { createAdminApp } from '../../firebase-app';


export const createRtdbAdminMock = <T extends IMockStore<"RealTimeAdmin">>(store: T) => {
  const db: DbFrom<TSdk> = {
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
    goOffline() { },
    goOnline() { },
    async setRules() { },
  };

  return db;
};
