import {
  IAuthApi,
  IDatabaseSdk,
  IMockAuthConfig,
  IMockAuthMgmt,
  isAdminSdk,
} from '@forest-fire/types';
import { createAuthManager } from './createAuthManager';
import { createClientAuth } from './client-sdk/index';
import { createAdminAuth } from './admin-sdk/createAdminAuth';

/**
 * A factory function which generates the appropriate Auth API (for the
 * passed in SDK) as well as a `authManager` API to manipulate the auth state
 * with super-powers.
 */
export async function createAuth(
  container: IDatabaseSdk,
  mockAuth: IMockAuthConfig
): Promise<[IAuthApi, IMockAuthMgmt]> {
  const authManager = createAuthManager();
  authManager.initializeAuth(mockAuth);

  return Promise.resolve([
    isAdminSdk(container)
      ? createAdminAuth(authManager)
      : createClientAuth(authManager),
    authManager,
  ]);
}
