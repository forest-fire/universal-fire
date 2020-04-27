import { EventManager } from './EventManager';
import { FirebaseNamespace, FirebaseApp } from '@firebase/app-types';
import { RealTimeDb } from '@forest-fire/real-time-db';
import { IClientConfig, IClientAuth, IMockConfig, IRtdbDatabase } from '@forest-fire/types';
export declare enum FirebaseBoolean {
    true = 1,
    false = 0
}
export declare let MOCK_LOADING_TIMEOUT: number;
export declare class RealTimeClient extends RealTimeDb {
    /**
     * Uses configuration to connect to the `RealTimeDb` database using the Client SDK
     * and then returns a promise which is resolved once the _connection_ is established.
     */
    /** lists the database names which are currently connected */
    static connectedTo(): Promise<string[]>;
    protected _isAdminApi: boolean;
    protected _eventManager: EventManager;
    protected _database: IRtdbDatabase;
    protected _auth: IClientAuth;
    protected _config: IClientConfig | IMockConfig;
    protected _fbClass: FirebaseNamespace | (FirebaseNamespace & {
        auth: () => FirebaseNamespace['auth'];
    });
    protected _authProviders: FirebaseNamespace['auth'];
    protected app: FirebaseApp;
    constructor(config: IClientConfig | IMockConfig);
    connect(): Promise<void>;
    /**
     * access to provider specific providers
     */
    get authProviders(): FirebaseNamespace['auth'];
    auth(): Promise<IClientAuth>;
    /**
     * Sets up the listening process for connection status
     */
    protected listenForConnectionStatus(): void;
}
