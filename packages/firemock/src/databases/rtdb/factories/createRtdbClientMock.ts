/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-empty-function */
import { DbFrom, IMockDatabase, IMockStore, SDK, IMockAuthConfig } from '@forest-fire/types';
import { url } from 'common-types';
import { reference } from '../index';
import { createAuth } from '~/auth/createAuth';
import { createFirebaseApp } from '~/databases/firebase-app';

export function createRtdbClientMock<T extends IMockStore<'RealTimeClient'>>(
  store: T,
  config: IMockAuthConfig
): IMockDatabase<SDK.RealTimeClient> {
  const db: DbFrom<SDK.RealTimeClient> = {
    useEmulator(_host, _port) {},
    get app() {
      return createFirebaseApp(SDK.RealTimeClient, store);
    },
    ref(path?: string) {
      return reference(store, path);
    },
    refFromURL(url: url) {
      return reference(store, url);
    },
    goOffline() {},
    goOnline() {},
  };

  const [auth, authManager] = createAuth(SDK.RealTimeClient, config);

  return {
    sdk: SDK.RealTimeClient,
    db,
    store,
    auth,
    authManager
  };
}
