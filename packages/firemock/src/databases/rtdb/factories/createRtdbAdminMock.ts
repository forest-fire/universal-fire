/* eslint-disable @typescript-eslint/no-empty-function */
import {
  IMockStore,
  IRtdbAdminReference,
  DbFrom,
} from '@forest-fire/types';
import { url } from 'common-types';

import { reference } from '..';
import { createAdminApp } from '../../firebase-app';


export const createRtdbAdminMock = <T extends IMockStore<"RealTimeAdmin">>(store: T) => {
  const db: DbFrom<"RealTimeAdmin"> = {
    app: createAdminApp(store),
    ref() {
      return reference(store, null) as IRtdbAdminReference;
    },
    refFromURL(url: url) {
      return reference(store, null) as IRtdbAdminReference;
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async getRules() {
      return JSON.stringify(store.rules);
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async getRulesJSON() {
      return store.rules;
    },
    goOffline() { },
    goOnline() { },
    async setRules() { },
  };

  return db;
};
