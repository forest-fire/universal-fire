import { FireMockError } from '@/errors';
import type { ActionCodeInfo, IClientAuth } from '@forest-fire/types';

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
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  async getRedirectResult() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  isSignInWithEmailLink() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  onIdTokenChanged() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  async sendSignInLinkToEmail() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },

  async signInAndRetrieveDataWithCredential() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },

  async signInWithCredential() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  async signInWithCustomToken() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  async signInWithEmailLink() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  async signInWithPhoneNumber() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  async signInWithPopup() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  async signInWithRedirect() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  async useDeviceLanguage() {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
  async verifyPasswordResetCode(code: string) {
    throw new FireMockError(
      'This feature is not implemented yet in FireMock auth module',
      'auth/not-implemented'
    );
  },
};
