/* eslint-disable @typescript-eslint/require-await */
import type {
  ActionCodeInfo,
  ActionCodeSettings,
  IAuthObserver,
  IClientAuth,
} from '@forest-fire/types';
import {createError} from 'brilliant-errors';

/**
 * Implements the interface's functions but functions just
 * throw errors.
 */
export const notImplemented: Omit<
  IClientAuth,
  'app' | 'settings' | 'currentUser' | 'languageCode' | 'tenantId'
> = {
  useEmulator(url, opts) {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  emulatorConfig: null,
  onAuthStateChanged(nextOrObserver: IAuthObserver) {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async signInAnonymously() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async updateCurrentUser(user: User) {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async confirmPasswordReset(code: string, newPassword: string) {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async verifyPasswordResetCode(code: string) {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async useDeviceLanguage() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async setPersistence() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  // async isSignInWithEmailLink(emailLink: string) {
  //   throw createError(
  //     'auth/not-implemented',
  //     'This feature is not implemented yet in FireMock auth module'
  //   );
  // },

  async signInWithEmailAndPassword(email: string, password: string) {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async createUserWithEmailAndPassword(email: string, password: string) {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async sendPasswordResetEmail(
    email: string,
    actionCodeSetting: ActionCodeSettings
  ) {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  async signOut() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async applyActionCode(code: string) {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  async checkActionCode(code: string): Promise<ActionCodeInfo> {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async fetchSignInMethodsForEmail() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  async getRedirectResult() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  isSignInWithEmailLink() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  onIdTokenChanged() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  async sendSignInLinkToEmail() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async signInAndRetrieveDataWithCredential() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },

  async signInWithCredential() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  async signInWithCustomToken() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  async signInWithEmailLink() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  async signInWithPhoneNumber() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  async signInWithPopup() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  async signInWithRedirect() {
    throw createError(
      'auth/not-implemented',
      'This feature is not implemented yet in FireMock auth module'
    );
  },
  // async useDeviceLanguage() {
  //   throw createError(
  //     'auth/not-implemented',
  //     'This feature is not implemented yet in FireMock auth module'
  //   );
  // },
  // async verifyPasswordResetCode(code: string) {
  //   throw createError(
  //     'auth/not-implemented',
  //     'This feature is not implemented yet in FireMock auth module'
  //   );
  // },
};
