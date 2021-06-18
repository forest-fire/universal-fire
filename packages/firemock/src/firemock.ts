import {
  IDatabaseSdk,
  IDb,
  IMockAuthConfig,
  IMockDatabase,
  IMockDbFactory,
  IMockServerOptions,
  ISdk,
  NetworkDelay,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';
import { createAuth } from './auth/createAuth';
import { createDatabase } from './databases/createDatabase';

/**
 * Provides an asynchronous factory function which will setup both the mock
 * database and mock auth service.
 */
const firemock = async <TDatabase extends IDatabaseSdk<TSdk>, TSdk extends ISdk>(
  container: TDatabase,
  mockData: IDictionary,
  mockAuth: IMockAuthConfig = { providers: [], users: [] },
  options: IMockServerOptions = {}
): Promise<IMockDatabase<TSdk>> => {
  const [auth, authManager] = await createAuth(container, mockAuth);
  const [db, store] = createDatabase(container, mockData);

  authManager.setNetworkDelay(options.networkDelay || NetworkDelay.lazer);

  return {
    db,
    auth,
    authManager,
    store,
  };

};

export default firemock;
