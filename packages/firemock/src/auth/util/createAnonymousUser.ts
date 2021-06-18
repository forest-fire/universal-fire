import { User } from '@forest-fire/types';

export function createAnonymousUser(uid: string): User {
  return {
    uid,
    isAnonymous: true,
    // TODO: Implement 
    // ...authUsersApi,
  } as unknown as User;
}
