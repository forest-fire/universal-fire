import type { UserCredential, ConfirmationResult } from '@forest-fire/types';
import merge from 'deepmerge';

import { clientApiUser } from './UserObject';
import { getRandomMockUid } from '../state-mgmt';
import { IPartialUserCredential } from '../../index';

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
      ...clientApiUser,
      displayName: '',
      email: '',
      isAnonymous: true,
      metadata: {},
      phoneNumber: '',
      photoURL: '',
      providerData: [],
      providerId: '',
      refreshToken: '',
      uid: getRandomMockUid(),
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
  };

  return merge(fakeUserCredential, partial) as UserCredential;
}

export const fakeApplicationVerifier: ConfirmationResult = {
  async confirm(verificationCode: string) {
    return completeUserCredential({});
  },
  verificationId: 'verification',
};
