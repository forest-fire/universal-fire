import type { ActionCodeSettings, IAdminAuth } from "@forest-fire/types";

export const links: Partial<IAdminAuth> = {
  // https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth#generate-email-verification-link
  async generateEmailVerificationLink(
    email: string,
    actionCodeSetting?: ActionCodeSettings
  ): Promise<string> {
    return "";
  },
};
