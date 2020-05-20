import { RealTimeDb, IRealTimeDb } from '@forest-fire/real-time-db';
import { IClientConfig, IClientAuth, IMockConfig, IRtdbDatabase, IClientApp } from '@forest-fire/types';
export declare enum FirebaseBoolean {
    true = 1,
    false = 0
}
import { EventManager } from './private';
import { FirebaseNamespace } from '@firebase/app-types';
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
    protected _database?: IRtdbDatabase;
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
    get authProviders(): {
        (app?: import("@firebase/app-types").FirebaseApp): import("@firebase/auth-types").FirebaseAuth;
        Auth: typeof import("@firebase/auth-types").FirebaseAuth;
        EmailAuthProvider: typeof import("@firebase/auth-types").EmailAuthProvider;
        EmailAuthProvider_Instance: typeof import("@firebase/auth-types").EmailAuthProvider_Instance;
        FacebookAuthProvider: typeof import("@firebase/auth-types").FacebookAuthProvider;
        FacebookAuthProvider_Instance: typeof import("@firebase/auth-types").FacebookAuthProvider_Instance;
        GithubAuthProvider: typeof import("@firebase/auth-types").GithubAuthProvider;
        GithubAuthProvider_Instance: typeof import("@firebase/auth-types").GithubAuthProvider_Instance;
        GoogleAuthProvider: typeof import("@firebase/auth-types").GoogleAuthProvider;
        GoogleAuthProvider_Instance: typeof import("@firebase/auth-types").GoogleAuthProvider_Instance;
        OAuthProvider: typeof import("@firebase/auth-types").OAuthProvider;
        SAMLAuthProvider: typeof import("@firebase/auth-types").SAMLAuthProvider;
        PhoneAuthProvider: typeof import("@firebase/auth-types").PhoneAuthProvider;
        PhoneAuthProvider_Instance: typeof import("@firebase/auth-types").PhoneAuthProvider_Instance;
        PhoneMultiFactorGenerator: typeof import("@firebase/auth-types").PhoneMultiFactorGenerator;
        RecaptchaVerifier: typeof import("@firebase/auth-types").RecaptchaVerifier;
        RecaptchaVerifier_Instance: typeof import("@firebase/auth-types").RecaptchaVerifier_Instance;
        TwitterAuthProvider: typeof import("@firebase/auth-types").TwitterAuthProvider;
        TwitterAuthProvider_Instance: typeof import("@firebase/auth-types").TwitterAuthProvider_Instance;
    };
    auth(): Promise<IClientAuth>;
    /**
     * The steps needed to connect a database to a Firemock
     * mocked DB.
     */
    protected _connectMockDb(config: IMockConfig): Promise<void>;
    protected _connectRealDb(config: IClientConfig): Promise<void>;
    protected loadAuthApi(): Promise<void>;
    protected loadDatabaseApi(): Promise<void>;
    /**
     * Sets up the listening process for connection status.
     *
     * In addition, will return a promise which resolves at the point
     * the database connects for the first time.
     */
    protected _listenForConnectionStatus(): Promise<void>;
    protected _detectConnection(): Promise<void>;
}
