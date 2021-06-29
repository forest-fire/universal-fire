import { FireMockError } from '../../../errors/index';
import { IMockAuthMgmt, NetworkDelay } from '@forest-fire/types';
import { networkDelay } from '../../../util';

/**
 * **updateEmail**
 *
 * Gives a logged in user the ability to update their email address.
 *
 * Possible Errors:
 *
 * - auth/invalid-email
 * - auth/email-already-in-use
 * - auth/requires-recent-login
 *
 * [Documentation](https://firebase.google.com/docs/reference/js/firebase.User#update-email)
 *
 * > Note: The `forceLogin` is not part of Firebase API but allows mock user to force the
 * error condition associated with a user who's been logged in a long time.
 */
export const updateEmail = (api: IMockAuthMgmt) => async (
  newEmail: string,
  forceLogin?: boolean
): Promise<void> => {
  if (forceLogin) {
    throw new FireMockError(
      "updating a user's email address requires that the user have recently logged in; use 'reauthenticateWithCredential' to address this error.",
      'auth/requires-recent-login'
    );
  }
  await networkDelay(NetworkDelay.wifi);
  api.updateUser(api.getCurrentUser(), { email: newEmail });
};
