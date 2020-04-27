import { IAdminConfig } from '@forest-fire/types';
/**
 * extracts the Firebase **databaseURL** property either from the passed in
 * configuration or via the FIREBASE_DATABASE_URL environment variable.
 */
export declare function extractDataUrl(config: IAdminConfig): string | undefined;
