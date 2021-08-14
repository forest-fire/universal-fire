import {
  AdminSdk,
  ClientSdk,
  IMockAuthConfig,
  IMockAuthMgmt,
  isAdminSdk,
  ISdk,
} from '@forest-fire/types';
import { createAuthManager } from './createAuthManager';
import { createClientAuth } from './client-sdk/index';
import { createAdminAuth } from './admin-sdk/createAdminAuth';
import { AuthFrom } from '@forest-fire/types';

/**
 * A factory function which generates the appropriate Auth API (for the
 * passed in SDK) as well as a `authManager` API to manipulate the auth state
 * with super-powers.
 */
export function createAuth<TSdk extends ISdk>(
  sdk: TSdk,
  mockAuth: IMockAuthConfig
): [AuthFrom<TSdk>, IMockAuthMgmt<TSdk>] {
  const authManager = createAuthManager(sdk);
  authManager.initializeAuth(mockAuth);

  return (isAdminSdk(sdk)
    ? [createAdminAuth(authManager as IMockAuthMgmt<AdminSdk>), authManager] as [AuthFrom<TSdk>, IMockAuthMgmt<TSdk>]
    : [createClientAuth(authManager as IMockAuthMgmt<ClientSdk>), authManager] as [AuthFrom<TSdk>, IMockAuthMgmt<TSdk>])

}
