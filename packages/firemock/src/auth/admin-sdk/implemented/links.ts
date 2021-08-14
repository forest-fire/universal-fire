import type {
  ActionCodeSettings,
  IAdminAuth,
  IMockAuthMgmt,
  AdminSdk
} from '@forest-fire/types';

export const links: (api: IMockAuthMgmt<AdminSdk>) => Partial<IAdminAuth> = (api) => ({
  // https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth#generate-email-verification-link
  generateEmailVerificationLink(
    _email: string,
    _actionCodeSetting?: ActionCodeSettings
  ): Promise<string> {
    throw new Error('not implemented');
  },
});
