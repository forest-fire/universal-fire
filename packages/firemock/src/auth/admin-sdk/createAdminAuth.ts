import type { AdminSdk, IAdminAuth, IMockAuthMgmt } from '@forest-fire/types';
import { implemented, notImplemented } from './index';

/**
 * Passing the in the management API returns the Firebase Client Auth API
 */
export const createAdminAuth = <TSdk extends AdminSdk>(api: IMockAuthMgmt<TSdk>): IAdminAuth => {
  //TODO: Remove cast and complete implementation
  return {
    ...implemented(api),
    ...notImplemented
  } as IAdminAuth
};