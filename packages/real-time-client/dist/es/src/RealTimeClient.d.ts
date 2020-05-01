import { EventManager } from './EventManager';
import type { FirebaseNamespace } from '@firebase/app-types';
import { RealTimeDb, IRealTimeDb } from '@forest-fire/real-time-db';
import { IClientConfig, IClientAuth, IMockConfig, IRtdbDatabase, IClientApp } from '@forest-fire/types';
export declare enum FirebaseBoolean {
    true = 1,
    false = 0
}
export declare let MOCK_LOADING_TIMEOUT: number;
export declare class RealTimeClient extends RealTimeDb implements IRealTimeDb {
    /**
     * Uses configuration to connect to the `RealTimeDb` database using the Client SDK
     * and then returns a promise which is resolved once the _connection_ is established.
     */
    static connect(config: IClientConfig | IMockConfig): Promise<RealTimeClient>;
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
    protected _app: IClientApp;
    /**
     * Builds the client and then waits for all to `connect()` to
     * start the connection process.
     */
    constructor(config?: IClientConfig | IMockConfig);
    connect(): Promise<RealTimeClient>;
    /**
     * access to provider specific providers
     */
    get authProviders(): FirebaseNamespace['auth'];
    auth(): Promise<IClientAuth>;
    /**
     * The steps needed to connect a database to a Firemock
     * mocked DB.
     */
    protected connectMockDb(config: IMockConfig): Promise<void>;
    protected connectRealDb(config: IClientConfig): Promise<void>;
    protected loadAuthApi(): Promise<void>;
    protected loadDatabaseApi(): Promise<void>;
    /**
     * Sets up the listening process for connection status
     */
    protected listenForConnectionStatus(): void;
}
