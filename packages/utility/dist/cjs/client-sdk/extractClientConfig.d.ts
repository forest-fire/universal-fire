import { IClientConfig } from '@forest-fire/types';
/**
 * Extracts the client configuration from ENV variables and processes it
 * through either BASE64 or JSON decoding.
 */
export declare function extractClientConfig(): IClientConfig | undefined;
