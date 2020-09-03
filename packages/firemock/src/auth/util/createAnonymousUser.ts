import { User } from '@forest-fire/types';

export function createAnonymousUser(uid: string): User {
  return {
    uid,
    isAnonymous: true,
    ...authUsersApi,
  };
}
