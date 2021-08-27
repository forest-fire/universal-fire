import { SAMLAuthProvider as GoogleSAMLAuthProvider } from '@forest-fire/types';

export class SAMLAuthProvider implements GoogleSAMLAuthProvider {
  public providerId = 'saml' as const;
}
