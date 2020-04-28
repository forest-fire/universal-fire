import { IDictionary } from 'common-types';
/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
export declare function getRunningApps(apps: (IDictionary | null)[]): string[];
