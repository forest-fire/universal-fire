import type { IDatabaseConfig } from '@forest-fire/types';
import { FireError } from '../errors';

/**
 * Determines the appropriate App name based on the configuration passed in
 */
export function determineDefaultAppName(config?: IDatabaseConfig) {
  if (!config) {
    return '[DEFAULT]';
  }
  const url = config.databaseURL || process.env.FIREBASE_DATABASE_URL;
  if (!url && !config.mocking) {
    throw new FireError(
      `Attempt to determine a default name leverages the database URL property (when a real database connection is used) and it is not present!`,
      'not-ready'
    );
  }

  return config.name
    ? config.name
    : url
    ? url.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1')
    : 'mock-db-app-name';
}
