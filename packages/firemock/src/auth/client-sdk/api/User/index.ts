import type { User } from '@forest-fire/types';

import { getAnonymousUid } from '@/auth/user-mgmt/index';
import { notImplemented } from './notImplemented';
import { updateEmail } from './updateEmail';
import { updatePassword } from './updatePassword';
import { updateProfile } from './updateProfile';
import { userProperties } from './userProperties';
import { getIdToken } from './getIdToken';
import { getIdTokenResult } from './getIdTokenResult';

export const clientApiUser: User = {
  ...(notImplemented as Required<typeof notImplemented>),
  ...userProperties(getAnonymousUid()),
  getIdToken,
  getIdTokenResult,
  updateEmail,
  updatePassword,
  updateProfile,
};
