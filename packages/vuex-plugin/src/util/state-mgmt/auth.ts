import type { IClientAuth } from 'universal-fire';
import { getDatabase } from './database';

type IMockAuth = import('firemock').IMockAuth;
let _auth: IClientAuth | IMockAuth;

export async function getAuth(): Promise<IClientAuth | IMockAuth> {
  if (!_auth) {
    _auth = await getDatabase().auth();
  }

  return _auth;
}

export function setAuth(auth: IClientAuth) {
  _auth = auth;
}
