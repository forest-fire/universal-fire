import { networkDelay } from './util';
import type { IMockAuth } from '@forest-fire/types';
import { implemented } from './auth/client-sdk/implemented';

let hasConnectedToAuthService: boolean = false;

export const auth = async (): Promise<typeof authApi> => {
  if (hasConnectedToAuthService) {
    return authApi;
  }

  await networkDelay();

  hasConnectedToAuthService = true;
  return authApi;
};

// tslint:disable-next-line:no-object-literal-type-assertion
export const authApi = {
  ...implemented,
} as IMockAuth;
