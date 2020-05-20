import { extractEncodedString } from '../shared';
import type { IClientConfig } from '@forest-fire/types';

/**
 * Extracts the client configuration from ENV variables and processes it
 * through either BASE64 or JSON decoding.
 */
export function extractClientConfig() {
  return extractEncodedString<IClientConfig>(process.env.FIREBASE_CONFIG);
}
