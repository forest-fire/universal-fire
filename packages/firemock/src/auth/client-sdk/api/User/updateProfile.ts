import { updateUser, currentUser } from '../../../user-mgmt/index';

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
export async function updateProfile(profile: {
  displayName?: string;
  photoUrl?: string;
}) {
  updateUser(currentUser().uid, profile);
}
