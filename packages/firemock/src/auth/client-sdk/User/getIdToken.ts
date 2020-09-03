import { allUsers, currentUser, toUser } from '@/auth/util';
import { IMockAuthMgmt } from '@forest-fire/types';
import { atRandom } from 'native-dash';

export function getIdToken(api: IMockAuthMgmt) {
  return async (): Promise<string> => {
    const user = api.getCurrentUser();

    if (!user) {
      throw new Error('not logged in');
    }
    if (user.tokenIds) {
      return atRandom(user.tokenIds);
    } else {
      return Math.random().toString(36).substr(2, 10);
    }
  };
}
