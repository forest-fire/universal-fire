import type { GoogleAuthProvider as GoogleGoogleAuthProvider, AuthCredential, AuthProvider } from '@forest-fire/types';
import { IDictionary } from 'common-types';
export declare class GoogleAuthProvider implements GoogleGoogleAuthProvider {
    static PROVIDER_ID: string;
    static GOOGLE_SIGN_IN_METHOD: string;
    static credential(idToken?: string | null, accessToken?: string | null): AuthCredential;
    providerId: string;
    addScope(scope: string): AuthProvider;
    setCustomParameters(params: IDictionary): AuthProvider;
}