import type { User } from '@forest-fire/types';

export const userProperties = (uid: string) =>
  ({
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
  } as Partial<User>);
