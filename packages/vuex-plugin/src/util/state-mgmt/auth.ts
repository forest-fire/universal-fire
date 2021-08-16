import type { IClientAuth } from 'universal-fire';
import type { IMockAuth } from 'firemock';
import { getDatabase } from './database';

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
