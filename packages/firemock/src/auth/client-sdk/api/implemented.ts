import { IPartialUserCredential, IAuthObserver } from '@/@types/index';
import { networkDelay } from '@/util/index';
import { Omit } from 'common-types';
import { completeUserCredential } from '../helpers/index';
import {
  notImplemented,
  emailExistsAsUserInAuth,
  emailHasCorrectPassword,
  userUid,
  emailValidationAllowed,
  emailIsValidFormat,
  clientApiUser,
} from '@/auth/client-sdk/index';
import type {
  ActionCodeSettings,
  UserCredential,
  AuthCredential,
  User,
  IClientAuth,
} from '@forest-fire/types';

import { FireMockError } from '@/errors';
import {
  authProviders,
  setCurrentUser,
  clearCurrentUser,
  addAuthObserver,
  getAnonymousUid,
  currentUser,
  findKnownUser,
  addToUserPool,
} from '@/auth/user-mgmt';

export const implemented: Omit<IClientAuth, keyof typeof notImplemented> = {
  app: {
    name: 'mocked-app',
    options: {},
    async delete() {
      return;
    },
    automaticDataCollectionEnabled: false,
  },
  onAuthStateChanged(observer: IAuthObserver) {
    addAuthObserver(observer);
    // TODO: the typing in Firemock must be changed to convert a `currentUser` to either client or admin SDK; right now we're getting an
    observer((currentUser() as unknown) as User);
  },
  async setPersistence() {
    console.warn(
      `currently firemock accepts calls to setPersistence() but it doesn't support it.`
    );
  },
  signInAnonymously: async (): Promise<UserCredential> => {
    await networkDelay();

    if (authProviders().includes('anonymous')) {
      const user: User = {
        ...clientApiUser,
        isAnonymous: true,
        uid: getAnonymousUid(),
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

      const userCredential = completeUserCredential(credentials);
      addToUserPool(userCredential.user);
      setCurrentUser(userCredential);

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

    if (!emailValidationAllowed()) {
      throw new FireMockError(
        'email authentication not allowed',
        'auth/operation-not-allowed'
      );
    }
    if (!emailIsValidFormat(email)) {
      throw new FireMockError(`invalid email: ${email}`, 'auth/invalid-email');
    }

    const user = findKnownUser('email', email);
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

    if (!emailHasCorrectPassword(email, password)) {
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
    setCurrentUser(u);

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
    if (!emailValidationAllowed()) {
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

    const partial: IPartialUserCredential = {
      user: {
        email,
        isAnonymous: false,
        emailVerified: false,
        uid: userUid(email),
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
    addToUserPool({ uid: partial.user.uid, email, password });
    setCurrentUser(u);

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
    clearCurrentUser();
  },

  get currentUser() {
    return completeUserCredential({}).user;
  },

  languageCode: '',
  async updateCurrentUser() {
    return;
  },
  settings: {
    appVerificationDisabledForTesting: false,
  },
};
