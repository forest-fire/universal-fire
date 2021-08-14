import {
  DbFrom,
  IMockDatabase,
  IMockDelayedState,
  IRtdbAdminReference,
  IRtdbReference,
  isFirestoreDatabase,
  IMockConfigOptions,
  ISdk,
  AdminSdk,
  IMockStore,
  IRtdbSdk,
  isMockConfig,
} from '@forest-fire/types';
import { IDictionary, url } from 'common-types';
import { createAuth } from '~/auth/createAuth';
import { FireMockError } from '../errors';
import { createStore } from './createStore';
import { createFirebaseApp } from './firebase-app';
import { reference } from './rtdb';

/**
 * A factory object which returns an implementation to handle either RTDB or
 * Firestore database as well as distinguishing between the minor variance between
 * admin and client SDK's
 */
export function createDatabase<TSdk extends ISdk>(
  sdk: TSdk,
  /**
   * DB and Auth configuration for mock firebase
   */
  config: IMockConfigOptions = {},
  /**
   * The initial state of the database
   */
  initialState: IDictionary | IMockDelayedState<IDictionary> = {}
): IMockDatabase<TSdk> {
  const store = createStore(sdk, config.db, {
    ...(config?.db && isMockConfig(config.db) ? config.db.mockData : {}),
    ...initialState,
  });

  if (isFirestoreDatabase(sdk)) {
    throw new FireMockError(
      `Attempt to mock a Firestore database failed because this has not been implemented yet!`
    );
  }

  const db = {
    app: createFirebaseApp(sdk, store),
    ref(
      path?: string
    ): TSdk extends AdminSdk ? IRtdbAdminReference : IRtdbReference {
      return reference(
        store as IMockStore<IRtdbSdk>,
        path
      ) as TSdk extends AdminSdk ? IRtdbAdminReference : IRtdbReference;
    },
    refFromURL(url: url) {
      return reference(
        store as IMockStore<IRtdbSdk>,
        url
      ) as IRtdbAdminReference;
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async getRules() {
      return JSON.stringify(store.rules);
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    async getRulesJSON() {
      return store.rules;
    },
    goOffline() {
      throw new Error('goOffline() is not implemented');
    },
    goOnline() {
      throw new Error('goOnline() is not implemented');
    },
    setRules() {
      throw new Error('setRules() is not implemented');
    },
  } as unknown as DbFrom<TSdk>;
  const [auth, authManager] = createAuth(sdk, config.auth);

  return {
    db,
    auth,
    authManager,
    sdk,
    store,
  };
}
