import { implemented, notImplemented } from './index';
import type { ClientSdk, IClientAuth, IMockAuthMgmt } from '@forest-fire/types';

/**
 * Passing the in the management API returns the Firebase Client Auth API
 */
export const createClientAuth = <TSdk extends ClientSdk>(api: IMockAuthMgmt<TSdk>): IClientAuth => {
    //TODO: Remove cast and complete implementation
  return {
    ...notImplemented,
    ...implemented(api),
  } as IClientAuth;
};
