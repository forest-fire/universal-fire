import type { IAdminAuth, IMockAuthMgmt } from '@forest-fire/types';
import { implemented, notImplemented } from './index';

/**
 * Passing the in the management API returns the Firebase Client Auth API
 */
export const createAdminAuth = (api: IMockAuthMgmt): IAdminAuth => {
  //TODO: Remove cast and complete implementation
  return {
    ...implemented(api),
    ...notImplemented
  } as IAdminAuth
};