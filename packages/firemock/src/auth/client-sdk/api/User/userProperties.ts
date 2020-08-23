import type { User } from '@forest-fire/types';
export { User };

export const userProperties = (uid: string): Partial<User> => ({
  displayName: '',
  email: '',
  isAnonymous: true,
  metadata: {},
  phoneNumber: '',
  photoURL: '',
  providerData: [],
  providerId: '',
  refreshToken: '',
  uid,
});
