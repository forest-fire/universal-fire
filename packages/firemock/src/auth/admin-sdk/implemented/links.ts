import type {
  ActionCodeSettings,
  IAdminAuth,
  IMockAuthMgmt,
} from '@forest-fire/types';

export const links: (api: IMockAuthMgmt) => Partial<IAdminAuth> = (api) => ({
  // https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth#generate-email-verification-link
  async generateEmailVerificationLink(
    email: string,
    actionCodeSetting?: ActionCodeSettings
  ): Promise<string> {
    return '';
  },
});
