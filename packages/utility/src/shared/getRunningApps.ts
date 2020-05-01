import { IAdminApp, IClientApp } from '@forest-fire/types';

/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
export function getRunningApps(
  apps: (IAdminApp | IClientApp | null)[]
): string[] {
  return ((apps.filter(i => i !== null) as unknown) as (
    | IAdminApp
    | IClientApp
  )[]).map(i => i.name);
}
