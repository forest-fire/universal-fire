import { implemented, notImplemented } from './index';
import type { IClientAuth, IMockAuthMgmt } from '@forest-fire/types';

/**
 * Passing the in the management API returns the Firebase Client Auth API
 */
export const createClientAuth = (api: IMockAuthMgmt): IClientAuth => {
  return {
    ...notImplemented,
    ...implemented(api),
  };
};
