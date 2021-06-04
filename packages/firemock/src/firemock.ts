import {
  IMockDatabase,
  IMockDbFactory,
  NetworkDelay,
} from '@forest-fire/types';
import { createAuth } from './auth/createAuth';
import { createDatabase } from './databases/createDatabase';

/**
 * Provides an asynchronous factory function which will setup both the mock
 * database and mock auth service.
 */
const firemock: IMockDbFactory = async (
  container,
  mockData,
  mockAuth = { providers: [], users: [] },
  options = {}
) => {
  const [auth, authManager] = await createAuth(container, mockAuth);
  const [db, store] = createDatabase(container, mockData);

  authManager.setNetworkDelay(options.networkDelay || NetworkDelay.lazer);

  const fm: IMockDatabase = {
    db,
    auth,
    authManager,
    store,
  };

  return fm;
};

export default firemock;
