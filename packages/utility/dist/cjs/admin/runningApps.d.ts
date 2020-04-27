import { IDictionary } from 'common-types';
/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
export declare function runningApps(apps: (IDictionary | null)[]): string[];
