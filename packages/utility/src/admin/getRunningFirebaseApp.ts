import { IDictionary } from 'common-types';
import { IAdminFirebaseApp } from '@forest-fire/types';

/** Gets the  */
export function getRunningFirebaseApp(
  name: string | undefined,
  apps: (IDictionary | null)[]
): IAdminFirebaseApp | undefined {
  return name
    ? (apps.find(i => i && i.name === name) as IAdminFirebaseApp)
    : undefined;
}
