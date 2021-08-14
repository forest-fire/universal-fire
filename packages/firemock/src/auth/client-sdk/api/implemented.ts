/* eslint-disable @typescript-eslint/require-await */
import { IPartialUserCredential } from '~/@types/index';
import {
  emailExistsAsUserInAuth,
  emailHasCorrectPassword,
  userUid,
  emailValidationAllowed,
  emailIsValidFormat,
} from '~/auth/client-sdk/index';
import {
  ActionCodeSettings,
  UserCredential,
  AuthCredential,
  IClientAuth,
  IAuthObserver,
  IMockAuthMgmt,
  AuthProviderName,
  Unsubscribe,
  UpdateRequest,
  ClientSdk,
  User,
} from '@forest-fire/types';

import { FireMockError } from '~/errors';
import { networkDelay } from '~/util';
import { uuid } from 'native-dash';
import { clientApiUser } from './User';

export const implemented: (
  api: IMockAuthMgmt<ClientSdk>
) => Partial<IClientAuth> = (api) => ({
  tenantId: '',

  languageCode: '',
  settings: {
    appVerificationDisabledForTesting: false,
  },

  app: {
    name: 'mocked-app',
    options: {},
    async delete() {
      return;
    },
    automaticDataCollectionEnabled: false,
  },

  onAuthStateChanged(
    observer: IAuthObserver,
    error?: (a: Error & { code: string }) => any,
    completed?: Unsubscribe
  ): Unsubscribe {
    api.addAuthObserver(observer);
    observer(api.createUser(api, api.toUser(api.getCurrentUser())));
    return undefined;
  },
  async setPersistence() {
    console.warn(
      `currently firemock accepts calls to setPersistence() but it doesn't support it.`
    );
    return;
  },
  signInAnonymously: async (): Promise<UserCredential> => {
    await networkDelay();

    if (api.authProviders().includes('anonymous')) {
      const user: User = {
        ...clientApiUser,
        isAnonymous: true,
        uid: uuid(),
      };
      const credential: AuthCredential = {
        signInMethod: 'anonymous',
        providerId: 'anonymous',
        toJSON: () => '', // recently added
      };
      const credentials = {
        user,
        credential,
      };

      const userCredential = api.completeUserCredential(credentials);
      api.addToUserPool(userCredential.user);
      api.setCurrentUser(userCredential);

      return userCredential;
    } else {
      throw new FireMockError(
        'you must enable anonymous auth in the Firebase Console',
        'auth/operation-not-allowed'
      );
    }
  },
  /**
   * Sign into Firebase with Email and Password:
   * [Docs](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signinwithemailandpassword)
   *
   * Error Codes:
   *  - auth/invalid-email
   *  - auth/user-disabled
   *  - auth/user-not-found
   *  - auth/wrong-password
   */
  async signInWithEmailAndPassword(email: string, password: string) {
    await networkDelay();

    if (!api.emailValidationAllowed()) {
      throw new FireMockError(
        'email authentication not allowed',
        'auth/operation-not-allowed'
      );
    }
    if (!emailIsValidFormat(email)) {
      throw new FireMockError(`invalid email: ${email}`, 'auth/invalid-email');
    }
    const user = api.findKnownUser('email', email);
    if (!user) {
      throw new FireMockError(
        `The email "${email}" is not a known user in the mock database`,
        `auth/user-not-found`
      );
    }
    if (user.disabled) {
      throw new FireMockError(
        `The user identified by "${user.email}" has been disabled!`,
        `auth/user-disabled`
      );
    }

    if (!emailHasCorrectPassword(api)(email, password)) {
      throw new FireMockError(
        `Invalid password for ${email}`,
        'auth/wrong-password'
      );
    }

    const partial: IPartialUserCredential = {
      user: {
        email: user.email,
        isAnonymous: false,
        emailVerified: user.emailVerified,
        uid: userUid(email),
        displayName: user.displayName,
        ...api.createUser(api, user as unknown as Partial<User>),
      },
      credential: {
        signInMethod: 'signInWithEmailAndPassword',
        providerId: '',
      },
      additionalUserInfo: {
        username: email,
      },
    };

    const u = api.completeUserCredential(partial);
    api.setCurrentUser(u);

    return u;
  },

  /**
   * Add a new user with the Email/Password provider.
   *
   * Possible errors:
   * - auth/email-already-in-use
   * - auth/invalid-email
   * - auth/operation-not-allowed
   * - auth/weak-password
   *
   * [Docs](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#createuserwithemailandpassword)
   */
  async createUserWithEmailAndPassword(email: string, password: string) {
    await networkDelay();
    if (!api.emailValidationAllowed()) {
      throw new FireMockError(
        'email authentication not allowed',
        'auth/operation-not-allowed'
      );
    }

    if (emailExistsAsUserInAuth(email)) {
      throw new FireMockError(
        `"${email}" user already exists`,
        'auth/email-already-in-use'
      );
    }

    if (!emailIsValidFormat(email)) {
      throw new FireMockError(
        `"${email}" is not a valid email format`,
        'auth/invalid-email'
      );
    }
    const uid = userUid(api)(email);

    const partial: IPartialUserCredential = {
      user: {
        ...api.createUser(api, { email, uid }),
        isAnonymous: false,
        emailVerified: false,
      },
      credential: {
        signInMethod: 'signInWithEmailAndPassword',
        providerId: '',
      },
      additionalUserInfo: {
        username: email,
      },
    };
    const u = api.completeUserCredential(partial);
    api.addToUserPool({ uid: partial.user.uid, email, password });
    api.setCurrentUser(u);
    return u;
  },

  async confirmPasswordReset(code: string, newPassword: string) {
    return;
  },

  async sendPasswordResetEmail(
    email: string,
    actionCodeSetting: ActionCodeSettings
  ) {
    return;
  },

  async signOut() {
    api.clearCurrentUser();
  },

  get currentUser() {
    return api.completeUserCredential({}).user;
  },

  async updateCurrentUser() {
    return;
  },
});
