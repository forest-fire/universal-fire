import type { User } from '@forest-fire/types';
import { getAnonymousUid } from '@/auth/state-mgmt/index';
console.log(getAnonymousUid);

export const userProperties: () => Partial<User> = () => ({
  displayName: '',
  email: '',
  isAnonymous: true,
  metadata: {},
  phoneNumber: '',
  photoURL: '',
  providerData: [],
  providerId: '',
  refreshToken: '',
  uid: getAnonymousUid(),
});
