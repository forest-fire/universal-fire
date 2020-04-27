import { IAdminConfig } from '@forest-fire/types';
import { FireError } from '../index';

/**
 * extracts the Firebase **databaseURL** property either from the passed in
 * configuration or via the FIREBASE_DATABASE_URL environment variable.
 */
export function extractDataUrl(config: IAdminConfig) {
  const dataUrl = config.databaseUrl || process.env['FIREBASE_DATABASE_URL'];
  if (!dataUrl) {
    throw new FireError(
      `There was no DATABASE URL provided! This needs to be passed in as part of the configuration or as the FIREBASE_DATABASE_URL environment variable.`
    );
  }
  return dataUrl;
}
