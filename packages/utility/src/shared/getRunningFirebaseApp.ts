import type { IAdminApp, IClientApp } from '@forest-fire/types';
import { FireError } from '../errors';

/** Gets the  */
export function getRunningFirebaseApp<T extends IAdminApp | IClientApp>(
  name: string | undefined,
  apps: T[]
): T {
  const result = name ? (apps.find(i => i && i.name === name) as T) : undefined;
  if (!result) {
    throw new FireError(
      `Attempt to get the Firebase app named "${name}" failed`,
      'invalid-app-name'
    );
  }
  return result;
}
