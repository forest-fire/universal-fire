import type { IDatabaseConfig } from '@forest-fire/types';

export function determineDefaultAppName(config?: IDatabaseConfig) {
  if (!config) {
    return '[DEFAULT]';
  }
  return config.name
    ? config.name
    : config.databaseURL
    ? config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1')
    : '[DEFAULT]';
}
