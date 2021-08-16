import { IMockUserRecord, UserCredential } from '@forest-fire/types';
import { toUser } from './toUser';

export function toUserCredential(user: IMockUserRecord): UserCredential {
  return {
    credential: {
      providerId: user.providerId,
      signInMethod: '',
      toJSON() {
        return { providerId: user.providerId };
      },
    },
    /** the client SDK's `User` type */
    user: toUser(user),
    additionalUserInfo: {
      isNewUser: false,
      profile: {},
      providerId: user.providerId,
      username: user.email,
    },
    /** not sure what this is intended to be */
    operationType: '',
  };
}
