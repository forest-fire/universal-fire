import type {
  GoogleFacebookAuthProvider,
  AuthCredential,
  AuthProvider,
  FacebookAuthProvider_Instance,
} from '@forest-fire/types';
import { AuthProviderName } from '@forest-fire/types';
import { IDictionary } from 'common-types';

export class FacebookAuthProvider
  implements FacebookAuthProvider_Instance, GoogleFacebookAuthProvider {
  public static PROVIDER_ID: string;
  public static FACEBOOK_SIGN_IN_METHOD: string;
  public static credential(token: string): AuthCredential {
    throw new Error('FacebookAuthProvider not implemented yet');
  }
  public providerId: string = AuthProviderName.facebook;
  public addScope(scope: string): AuthProvider {
    throw new Error('not implemented');
  }
  public setCustomParameters(params: IDictionary): AuthProvider {
    throw new Error('not implemented');
  }
}
