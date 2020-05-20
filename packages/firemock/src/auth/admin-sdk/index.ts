import { implemented } from './implemented';
import { notImplemented } from './not-implemented';
import type { Auth } from '@forest-fire/types';

export const adminAuthSdk: Auth = {
  ...implemented,
  ...notImplemented,
} as Auth;
