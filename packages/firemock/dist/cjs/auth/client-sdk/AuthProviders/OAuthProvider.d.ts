import { OAuthProvider as GoogleOAuthProvider, AuthProvider, OAuthCredential } from "@forest-fire/types";
export declare class OAuthProvider implements GoogleOAuthProvider {
    providerId: string;
    constructor(providerId: string);
    addScope(scope: string): AuthProvider;
    credential(idToken?: string, accessToken?: string): OAuthCredential;
    setCustomParameters(customOAuthParameters: Object): AuthProvider;
}
