import { extractEncodedString } from '../shared';
/**
 * Extracts the client configuration from ENV variables and processes it
 * through either BASE64 or JSON decoding.
 */
export function extractClientConfig() {
    return extractEncodedString(process.env.FIREBASE_CONFIG);
}
//# sourceMappingURL=extractClientConfig.js.map