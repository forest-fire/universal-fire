import { IFirebaseApp } from '@forest-fire/types';
import { IDictionary } from 'common-types';

/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
export function getRunningApps(apps: (IDictionary | null)[]): string[] {
  return ((apps.filter(i => i !== null) as unknown) as IFirebaseApp[]).map(
    i => i.name
  );
}
