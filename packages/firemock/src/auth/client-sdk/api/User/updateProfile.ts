import { networkDelay } from '~/util';
import { IMockAuthMgmt, NetworkDelay, ClientSdk } from '@forest-fire/types';

/**
 * Updates a user's profile data.
 * 
 * Example:
 * 
 * ```typescript
 * user.updateProfile({
      displayName: "Jane Q. User",
      photoURL: "https://example.com/jane-q-user/profile.jpg"
  })
 * ```

 [Documentation](https://firebase.google.com/docs/reference/js/firebase.User#updateprofile)
 */
export const updateProfile =
  (api: IMockAuthMgmt<ClientSdk>) =>
  async (profile: { displayName?: string; photoUrl?: string }) => {
    await networkDelay(NetworkDelay.wifi);
    api.updateUser(api.getCurrentUser(), profile);
  };
