import { AbstractedDatabase } from './AbstractedDatabase';
import { IAdminConfig, IClientConfig, IMockConfig } from '@forest-fire/types';
export declare class DB {
    /**
     * A static initializer which can hand back any of the supported SDK's for either
     * Firestore or Real-Time Database.
     *
     * @param constructor The DB/SDK class which you wish to use
     * @param config The database configuration
     */
    static connect<T extends AbstractedDatabase>(constructor: new (config: any) => T, config: IAdminConfig | IClientConfig | IMockConfig): Promise<T>;
}
