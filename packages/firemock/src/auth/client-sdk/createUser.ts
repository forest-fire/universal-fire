import { IMockAuthMgmt, ISdk, User } from '@forest-fire/types';
import {
  getIdToken,
  getIdTokenResult,
  notImplemented,
  updateEmail,
  updatePassword,
  updateProfile,
} from './User';

/**
 * Combines the property and API aspects into a `User` object where
 * the API aspects are provided access to the `IMockAuthMgmt` api to
 * ensure function calls effect the correct AUTH instance.
 */
export function createUser(api: IMockAuthMgmt<ISdk>, user: Partial<User>): User {
  const fns = {
    ...(notImplemented as Required<typeof notImplemented>),
    getIdToken,
    getIdTokenResult,
    updateEmail,
    updatePassword,
    updateProfile,
  };

  return {
    isAnonymous: false,
    emailVerified: user.email ? true : false,
    ...fns,
    ...user,
  } as User;
}
