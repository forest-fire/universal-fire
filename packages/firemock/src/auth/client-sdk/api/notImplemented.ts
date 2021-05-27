import type { ActionCodeInfo, IClientAuth } from '@forest-fire/types';
import { createError } from 'common-types';

export const notImplemented: Partial<IClientAuth> = {
  async applyActionCode(code: string) {
    return;
  },
  async checkActionCode(code: string): Promise<ActionCodeInfo> {
    return {
      data: {},
      operation: '',
    };
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
  async useDeviceLanguage() {
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
};
