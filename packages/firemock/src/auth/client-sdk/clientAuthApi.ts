import { implemented, notImplemented } from './api';
import type { IClientAuth, IFirebaseApp } from '@forest-fire/types';

/**
 * The mocked Client SDK of Firebase's Auth service
 */
export const clientAuthSdk: IClientAuth = {
  ...notImplemented,
  ...implemented,
} as IClientAuth;
