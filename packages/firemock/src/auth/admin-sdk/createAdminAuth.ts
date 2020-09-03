import { implemented, notImplemented } from './index';
import type { IAdminAuth, IMockAuthMgmt } from '@forest-fire/types';

/**
 * Passing the in the management API returns the Firebase Client Auth API
 */
export const createAdminAuth = (api: IMockAuthMgmt): IAdminAuth => {
  return {
    ...notImplemented,
    ...implemented(api),
  };
};
