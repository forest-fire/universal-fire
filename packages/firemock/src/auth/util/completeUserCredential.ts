import type { UserCredential, ConfirmationResult } from '@forest-fire/types';
import { randomUUID } from 'crypto';
import merge from 'deepmerge';

import { IPartialUserCredential } from '../../@types';

export { UserCredential };

/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
export function completeUserCredential(
  partial: IPartialUserCredential
): UserCredential {
  const fakeUserCredential: UserCredential = {
    user: {
      // TODO: Implement
      // ...clientApiUser,
      displayName: '',
      email: '',
      isAnonymous: true,
      metadata: {},
      phoneNumber: '',
      photoURL: '',
      providerData: [],
      providerId: '',
      refreshToken: '',
      // TODO: Check if this util method work as expected
      uid: randomUUID()
    },
    additionalUserInfo: {
      isNewUser: false,
      profile: '',
      providerId: '',
      username: 'fake',
    },
    operationType: '',
    credential: {
      signInMethod: 'fake',
      providerId: 'fake',
      toJSON: () => '', // added recently
    },
    // TODO: Implement
  } as unknown as UserCredential;

  return merge(fakeUserCredential, partial) as UserCredential;
}

export const fakeApplicationVerifier: ConfirmationResult = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async confirm(verificationCode: string) {
    return completeUserCredential({});
  },
  verificationId: 'verification',
};
