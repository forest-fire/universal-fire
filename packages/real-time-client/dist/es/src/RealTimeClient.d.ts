import { EventManager } from './EventManager';
import { FirebaseNamespace, FirebaseApp } from '@firebase/app-types';
import { RealTimeDb, IFirebaseClientConfig } from '@forest-fire/real-time-db';
export declare enum FirebaseBoolean {
    true = 1,
    false = 0
}
export declare let MOCK_LOADING_TIMEOUT: number;
export declare type FirebaseDatabase = import('@firebase/database-types').FirebaseDatabase;
export declare type FirebaseAuth = import('@firebase/auth-types').FirebaseAuth;
export { IFirebaseClientConfig } from 'abstracted-firebase';
export declare class RealTimeClient extends RealTimeDb {
    /**
     * Uses configuration to connect to the `RealTimeDb` database using the Client SDK
     * and then returns a promise which is resolved once the _connection_ is established.
     */
    static connect(config: IFirebaseClientConfig): Promise<RealTimeClient>;
    _isAdminApi: boolean;
    readonly config: IFirebaseClientConfig;
    /** lists the database names which are currently connected */
    static connectedTo(): Promise<string[]>;
    protected _eventManager: EventManager;
    protected _database: FirebaseDatabase;
    protected _auth: FirebaseAuth;
    protected _config: IFirebaseClientConfig;
    protected _fbClass: FirebaseNamespace | (FirebaseNamespace & {
        auth: () => FirebaseNamespace['auth'];
    });
    protected _authProviders: FirebaseNamespace['auth'];
    protected app: FirebaseApp;
    constructor(config: IFirebaseClientConfig);
    /**
     * access to provider specific providers
     */
    get authProviders(): FirebaseNamespace['auth'];
    auth(): Promise<FirebaseAuth>;
    /**
     * connect
     *
     * Asynchronously loads the firebase/app library and then
     * initializes a connection to the database.
     */
    protected connectToFirebase(config: IFirebaseClientConfig, useAuth?: boolean): Promise<void>;
    /**
     * Sets up the listening process for connection status
     */
    protected listenForConnectionStatus(): void;
}
