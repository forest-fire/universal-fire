import { IDictionary } from 'common-types';
import type { Auth, IMockAuthMgmt } from '@forest-fire/types';

export const claims: (api: IMockAuthMgmt) => Partial<Auth> = (api) => ({
  /**
   * Sets additional developer claims on an existing user identified by the provided uid,
   * typically used to define user roles and levels of access.
   */
  async setCustomUserClaims(
    uid: string,
    customClaims: IDictionary | null
  ): Promise<void> {
    api.updateUser(uid, { customClaims });
  },
});
