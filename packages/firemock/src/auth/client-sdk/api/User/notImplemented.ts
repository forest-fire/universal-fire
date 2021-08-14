import type {
  User,
  AuthCredential,
  ApplicationVerifier,
  AuthProvider,
  ActionCodeSettings,
  UserCredential,
} from '@forest-fire/types';
import { fakeApplicationVerifier } from '../../helpers/completeUserCredential';

export const notImplemented: Partial<User> = {
  /** Deletes and signs out the user. */
  delete(): Promise<void> {
    throw new Error(
      'the Mock Auth feature for delete() is not yet implemented'
    );
  },

  linkAndRetrieveDataWithCredential(credential: AuthCredential) {
    throw new Error(
      `linkAndRetrieveDataWithCredential() is not implemented yet in the client-sdk's mock auth`
    );
  },

  linkWithCredential(credential: AuthCredential) {
    throw new Error(
      `linkWithCredential() is not implemented yet in the client-sdk's mock auth`
    );
  },

  async linkWithPhoneNumber(
    phoneNUmber: string,
    applicationVerificer: ApplicationVerifier
  ) {
    return Promise.resolve(fakeApplicationVerifier);
  },

  linkWithPopup(provider: AuthProvider) {
    throw new Error(
      `linkWithPopup() is not implemented yet in the client-sdk's mock auth`
    );
  },
  linkWithRedirect(provider: AuthProvider) {
    throw new Error(
      `linkWithRedirect() is not implemented yet in the client-sdk's mock auth`
    );
  },
  reauthenticateAndRetrieveDataWithCredential(credential: AuthCredential) {
    throw new Error(
      `reauthenticateAndRetrieveDataWithCredential() is not implemented yet in the client-sdk's mock auth`
    );
  },
  reauthenticateWithCredential(credential: AuthCredential) {
    throw new Error(
      `reauthenticateWithCredential() is not implemented yet in the client-sdk's mock auth`
    );
  },
  async reauthenticateWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ) {
    return Promise.resolve(fakeApplicationVerifier);
  },
  reauthenticateWithPopup(provider: AuthProvider): Promise<UserCredential> {
    throw new Error(
      `reauthenticateWithPopup() is not implemented yet in the client-sdk's mock auth`
    );
  },
  reauthenticateWithRedirect(provider: AuthProvider) {
    throw new Error(
      `reauthenticateWithRedirect() is not implemented yet in the client-sdk's mock auth`
    );
  },
  reload(): Promise<void> {
    return;
  },
  sendEmailVerification(actionCodeSettings: ActionCodeSettings) {
    throw new Error(
      `sendEmailVerification() is not implemented yet in the client-sdk's mock auth`
    );
  },
  toJSON() {
    return {};
  },
  unlink(provider: string) {
    throw new Error(
      `unlink() is not implemented yet in the client-sdk's mock auth`
    );
  },
  updatePhoneNumber(phoneCredential: AuthCredential) {
    throw new Error(
      `updatePhoneNumber() is not implemented yet in the client-sdk's mock auth`
    );
  },
};
