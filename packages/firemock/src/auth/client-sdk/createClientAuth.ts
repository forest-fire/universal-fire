import { implemented, notImplemented } from './index';
import type { AuthFrom, ClientSdk, IMockAuthMgmt } from '@forest-fire/types';

/**
 * Passing the in the management API returns the Firebase Client Auth API
 */
export const createClientAuth = <TSdk extends ClientSdk>(api: IMockAuthMgmt<TSdk>): AuthFrom<TSdk> => {
  return {
    ...notImplemented,
    ...implemented(api),
  } as AuthFrom<TSdk>;
};
