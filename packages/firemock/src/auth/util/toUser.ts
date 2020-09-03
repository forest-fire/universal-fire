import { IMockUserRecord, User } from '@forest-fire/types';
import { clientApiUser } from '../client-sdk';

/**
 * Converts a known user to the `User` format used in the Firebase client SDK
 */
export function toUser(mockUser: IMockUserRecord): User {
  // TODO: implement
  const user: Omit<User, 'toJSON'> = {
    ...clientApiUser,
    uid: mockUser.uid,
    email: mockUser.email,
    emailVerified: mockUser.emailVerified,
    displayName: mockUser.displayName,
    isAnonymous: mockUser.isAnonymous,
    providerId: mockUser.providerId,
    providerData: mockUser.providerData,
  };

  return {
    ...user,
    toJSON: () => ({
      uid: user.uid,
      isAnonymous: user.isAnonymous,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
    }),
  };
}
