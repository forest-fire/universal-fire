import { IDictionary } from 'common-types';
import { IAdminFirebaseApp } from '@forest-fire/types';
import { FireError } from '../index';

/** Gets the  */
export function getRunningFirebaseApp(
  name: string | undefined,
  apps: (IDictionary | null)[]
): IAdminFirebaseApp {
  const result = name
    ? (apps.find(i => i && i.name === name) as IAdminFirebaseApp)
    : undefined;
  if (!result) {
    throw new FireError(
      `Attempt to get the Firebase app named "${name}" failed`,
      'invalid-app-name'
    );
  }
  return result;
}
