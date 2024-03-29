import type {
  GoogleAuthProvider as GoogleGoogleAuthProvider,
  AuthCredential,
  AuthProvider,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';

export class GoogleAuthProvider implements GoogleGoogleAuthProvider {
  public static PROVIDER_ID = 'google';
  public static GOOGLE_SIGN_IN_METHOD: string;

  public static credential(
    idToken?: string | null,
    accessToken?: string | null
  ): AuthCredential {
    throw new Error('not implemented');
  }

  public providerId: string;
  public addScope(scope: string): AuthProvider {
    throw new Error('not implemented');
  }
  public setCustomParameters(params: IDictionary): AuthProvider {
    throw new Error('not implemented');
  }
}
