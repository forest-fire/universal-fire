import {
  IDatabaseSdk,
  IMockAuthConfig,
  IMockAuthMgmt,
  isAdminSdk,
  ISdk,
} from '@forest-fire/types';
import { createAuthManager } from './createAuthManager';
import { createClientAuth } from './client-sdk/index';
import { createAdminAuth } from './admin-sdk/createAdminAuth';
import { AuthFrom } from '@forest-fire/types/src';

/**
 * A factory function which generates the appropriate Auth API (for the
 * passed in SDK) as well as a `authManager` API to manipulate the auth state
 * with super-powers.
 */
export async function createAuth<TDatabase extends IDatabaseSdk<TSdk>, TSdk extends ISdk>(
  container: TDatabase,
  mockAuth: IMockAuthConfig
): Promise<[AuthFrom<TSdk>, IMockAuthMgmt]> {
  const authManager = createAuthManager();
  authManager.initializeAuth(mockAuth);

  return Promise.resolve([
    (isAdminSdk(container)
      ? createAdminAuth(authManager)
      : createClientAuth(authManager)) as AuthFrom<TSdk>,
    authManager,
  ]);
}
