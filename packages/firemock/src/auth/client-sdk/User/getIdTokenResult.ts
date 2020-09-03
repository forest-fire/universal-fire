import type { IdTokenResult, IMockAuthMgmt } from '@forest-fire/types';
import { getIdToken } from './getIdToken';

export function getIdTokenResult(api: IMockAuthMgmt) {
  return (forceRefresh?: boolean) => {
    return async (): Promise<IdTokenResult> => ({
      authTime: '',
      claims: {},
      expirationTime: '',
      issuedAtTime: '',
      signInProvider: '',
      signInSecondFactor: '',
      token: await getIdToken(api)(),
    });
  };
}
