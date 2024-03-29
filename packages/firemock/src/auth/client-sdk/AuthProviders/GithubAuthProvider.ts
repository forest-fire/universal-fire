import type {
  GoogleGithubAuthProvider,
  AuthCredential,
  AuthProvider,
  GithubAuthProvider_Instance,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';

export class GithubAuthProvider
  implements GithubAuthProvider_Instance, GoogleGithubAuthProvider
{
  public static PROVIDER_ID = 'github';
  public static GITHUB_SIGN_IN_METHOD: string;

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
