import type {
  TwitterAuthProvider as GoogleTwitterAuthProvider,
  AuthCredential,
  TwitterAuthProvider_Instance,
  AuthProvider,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';

export class TwitterAuthProvider
  implements GoogleTwitterAuthProvider, TwitterAuthProvider_Instance {
  public static PROVIDER_ID: string;
  public static TWITTER_SIGN_IN_METHOD: string;

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
