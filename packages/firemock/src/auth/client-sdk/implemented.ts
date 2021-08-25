/* eslint-disable @typescript-eslint/require-await */
import { IPartialUserCredential } from '../../@types/index';
import {
  emailExistsAsUserInAuth,
  emailHasCorrectPassword,
  userUid,
  emailValidationAllowed,
  emailIsValidFormat,
} from '../../auth/client-sdk/index';
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

import { FireMockError } from '../../errors';
import { completeUserCredential, toUser } from '../../auth/util';
import { createUser } from './createUser';

export const implemented: (api: IMockAuthMgmt<ClientSdk>) => Partial<IClientAuth> = (
  api
) => ({
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
    observer(createUser(api, toUser(api.getCurrentUser())));
    return undefined;
  },

  async setPersistence() {
    console.warn(
      `currently firemock accepts calls to setPersistence() but it doesn't support it.`
    );
    return;
  },

  signInAnonymously: async (): Promise<UserCredential> => {
    await api.networkDelay();
    if (api.hasProvider(AuthProviderName.anonymous)) {
      const user = createUser(api, {
        isAnonymous: true,
        uid: api.getAnonymousUid(),
      });
      const credential: AuthCredential = {
        signInMethod: AuthProviderName.anonymous,
        providerId: AuthProviderName.anonymous,
        toJSON: () => ({
          signInMethod: AuthProviderName.anonymous,
          providerId: AuthProviderName.anonymous,
        }),
      };

      const userCredentials = completeUserCredential({ user, credential });
      api.addToUserPool(userCredentials);
      api.setCurrentUser(userCredentials);

      return userCredentials;
    } else {
      throw new FireMockError(
        'you must enable anonymous auth in the Firebase Console',
        'auth/operation-not-allowed'
      );
    }
  },

  async updateCurrentUser(updates: User) {
    api.updateUser(api.getCurrentUser().uid, updates);
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
    await api.networkDelay();

    if (!emailValidationAllowed(api)()) {
      throw new FireMockError(
        'email authentication not allowed',
        'auth/operation-not-allowed'
      );
    }
    if (!emailIsValidFormat(api)(email)) {
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
        uid: userUid(api)(email),
        displayName: user.displayName,
        ...createUser(api, user as unknown as Partial<User>),
      },
      credential: {
        signInMethod: 'signInWithEmailAndPassword',
        providerId: '',
      },
      additionalUserInfo: {
        username: email,
      },
    };

    const u = completeUserCredential(partial);
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
    await api.networkDelay();
    if (!emailValidationAllowed(api)()) {
      throw new FireMockError(
        'email authentication not allowed',
        'auth/operation-not-allowed'
      );
    }

    if (emailExistsAsUserInAuth(api)(email)) {
      throw new FireMockError(
        `"${email}" user already exists`,
        'auth/email-already-in-use'
      );
    }

    if (!emailIsValidFormat(api)(email)) {
      throw new FireMockError(
        `"${email}" is not a valid email format`,
        'auth/invalid-email'
      );
    }
    const uid = userUid(api)(email);

    const partial: IPartialUserCredential = {
      user: {
        ...createUser(api, { email, uid }),
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
    const u = completeUserCredential(partial);
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
    console.group('Firemock: sendPasswordResetEmail()');
    console.log(`an email is being sent to "${email}".`);
    console.log(`the "action code settings" are:`, actionCodeSetting);
    console.groupEnd();
  },

  async signOut() {
    api.logout();
  },

  get currentUser() {
    return completeUserCredential({}).user;
  },
});
