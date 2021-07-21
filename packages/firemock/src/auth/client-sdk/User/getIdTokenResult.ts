import type { IdTokenResult, IMockAuthMgmt } from '@forest-fire/types';
import { ClientSdk } from '@forest-fire/types';
import { getIdToken } from './getIdToken';

export function getIdTokenResult(api: IMockAuthMgmt<ClientSdk>) {
  return async (forceRefresh?: boolean): Promise<IdTokenResult> => {
    return {
      authTime: '',
      claims: {},
      expirationTime: '',
      issuedAtTime: '',
      signInProvider: '',
      signInSecondFactor: '',
      token: await getIdToken(api)(),
    };
  };
}
