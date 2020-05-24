import '@firebase/auth';
import '@firebase/database';
import { EventManager } from './private';
import { FirebaseNamespace, IClientApp, IClientAuth, IClientAuthProviders, IClientConfig, IMockConfig, SDK } from '@forest-fire/types';
import { IRealTimeDb, RealTimeDb } from '@forest-fire/real-time-db';
import { FirebaseDatabase } from '@firebase/database-types';
export declare let MOCK_LOADING_TIMEOUT: number;
export declare class RealTimeClient extends RealTimeDb implements IRealTimeDb {
    sdk: SDK;
    /**
     * Uses configuration to connect to the `RealTimeDb` database using the Client SDK
     * and then returns a promise which is resolved once the _connection_ is established.
     */
    static connect(config?: IClientConfig | IMockConfig): Promise<RealTimeClient>;
    /** lists the database names which are currently connected */
    static connectedTo(): Promise<string[]>;
    protected _isAdminApi: boolean;
    protected _eventManager: EventManager;
    protected _database?: FirebaseDatabase;
    protected _auth?: IClientAuth;
    protected _config: IClientConfig | IMockConfig;
    protected _fbClass: IClientApp;
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
    get authProviders(): IClientAuthProviders;
    auth(): Promise<IClientAuth>;
    /**
     * The steps needed to connect a database to a Firemock
     * mocked DB.
     */
    protected _connectMockDb(config: IMockConfig): Promise<void>;
    protected _connectRealDb(config: IClientConfig): Promise<void>;
    /**
     * Sets up the listening process for connection status.
     *
     * In addition, will return a promise which resolves at the point
     * the database connects for the first time.
     */
    protected _listenForConnectionStatus(): Promise<void>;
    protected _detectConnection(): Promise<void>;
}
