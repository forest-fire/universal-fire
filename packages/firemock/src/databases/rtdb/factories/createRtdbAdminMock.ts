/* eslint-disable @typescript-eslint/no-empty-function */
import { DbFrom, IMockAuthConfig, IMockDatabase, IMockStore, IRtdbAdminReference, SDK } from '@forest-fire/types';
import { url } from 'common-types';
import { createAuth } from '~/auth/createAuth';
import { createFirebaseApp } from '~/databases/firebase-app';
import { reference } from '..';

export function createRtdbAdminMock<T extends IMockStore<'RealTimeAdmin'>>(
  store: T,
  config: IMockAuthConfig
): IMockDatabase<SDK.RealTimeAdmin> {
  const db: DbFrom<SDK.RealTimeAdmin> = {
    app: createFirebaseApp(SDK.RealTimeAdmin, store),
    ref(path?: string) {
      return reference(store, path) as IRtdbAdminReference;
    },
    refFromURL(url: url) {
      return reference(store, url) as IRtdbAdminReference;
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
  } as unknown as DbFrom<SDK.RealTimeAdmin>;

  const [auth, authManager] = createAuth(SDK.RealTimeAdmin, config);

  return {
    sdk: SDK.RealTimeAdmin,
    db,
    store,
    auth,
    authManager
  }
}
