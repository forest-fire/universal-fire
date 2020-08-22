import { IAdminAuth } from '@forest-fire/types';
import { implemented } from './implemented';
import { notImplemented } from './notImplemented';

export const adminAuthSdk: IAdminAuth = {
  ...implemented,
  ...notImplemented,
} as IAdminAuth;
