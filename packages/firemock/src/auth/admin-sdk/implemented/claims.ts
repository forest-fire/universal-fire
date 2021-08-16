import { IDictionary } from 'common-types';
import type { AdminSdk, Auth, IMockAuthMgmt } from '@forest-fire/types';

export const claims: (api: IMockAuthMgmt<AdminSdk>) => Partial<Auth> = (api) => ({
  /**
   * Sets additional developer claims on an existing user identified by the provided uid,
   * typically used to define user roles and levels of access.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async setCustomUserClaims(
    uid: string,
    customClaims: IDictionary | null
  ): Promise<void> {
    api.updateUser(uid, { customClaims });
  },
});
