import { notImplemented } from './notImplemented';
import { implemented } from './implemented';
import type { FirebaseAuth } from '@forest-fire/types';

// tslint:disable-next-line:no-object-literal-type-assertion
export const authMockApi: FirebaseAuth = {
  ...notImplemented,
  ...implemented,
} as FirebaseAuth;
