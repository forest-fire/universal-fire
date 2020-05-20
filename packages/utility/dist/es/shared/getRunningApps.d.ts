import type { IAdminApp, IClientApp } from '@forest-fire/types';
/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
export declare function getRunningApps(apps: (IAdminApp | IClientApp | null)[]): string[];
