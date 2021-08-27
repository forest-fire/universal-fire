import {
  OAuthProvider as GoogleOAuthProvider,
  AuthProvider,
  OAuthCredential,
} from '@forest-fire/types';

export class OAuthProvider implements GoogleOAuthProvider {
  public providerId: string = 'oauth';
  // tslint:disable-next-line: no-empty
  constructor(providerId: string) {
    this.providerId = providerId;
  }
  public addScope(_scope: string): AuthProvider {
    throw new Error('not implemented');
  }
  public credential(_idToken?: string, _accessToken?: string): OAuthCredential {
    throw new Error('not implemented');
  }
  // tslint:disable-next-line: ban-types
  public setCustomParameters(
    _customOAuthParameters: Record<string, unknown>
  ): AuthProvider {
    throw new Error('not implemented');
  }
}
