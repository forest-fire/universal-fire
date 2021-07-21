import { IMockUserRecord, User } from '@forest-fire/types';

/**
 * Converts a known user to the `User` format used in the Firebase client SDK
 */
export function toUser(mockUser: IMockUserRecord): User {
  // TODO: implement

  const user: Omit<User, 'toJSON'> = {
    uid: mockUser.uid,
    email: mockUser.email,
    emailVerified: mockUser.emailVerified,
    displayName: mockUser.displayName,
    isAnonymous: mockUser.isAnonymous,
    providerId: mockUser.providerId,
    providerData: mockUser.providerData,
    // TODO: implement
  } as unknown as Omit<User, 'toJSON'>;

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
