import type { IAdminApp, IClientApp } from '@forest-fire/types';
/** Gets the  */
export declare function getRunningFirebaseApp<T extends IAdminApp | IClientApp>(name: string | undefined, apps: T[]): T;
