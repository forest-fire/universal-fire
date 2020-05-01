import { EventManager } from './EventManager';
import { ClientError } from './ClientError';
import { RealTimeDb } from '@forest-fire/real-time-db';
import { isMockConfig, isClientConfig } from '@forest-fire/types';
import { extractClientConfig, FireError, getRunningApps, getRunningFirebaseApp } from '@forest-fire/utility';
export var FirebaseBoolean;
(function (FirebaseBoolean) {
    FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
    FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean || (FirebaseBoolean = {}));
import { firebase } from '@firebase/app';
export let MOCK_LOADING_TIMEOUT = 200;
export class RealTimeClient extends RealTimeDb {
    /**
     * Builds the client and then waits for all to `connect()` to
     * start the connection process.
     */
    constructor(config) {
        super();
        this._isAdminApi = false;
        this._eventManager = new EventManager();
        this.CONNECTION_TIMEOUT = config.timeout || 5000;
        if (!config) {
            config = extractClientConfig();
            if (!config) {
                throw new FireError(``, ``);
            }
        }
        if (isClientConfig(config)) {
            config.name =
                config.name || config.databaseURL
                    ? config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1')
                    : '[DEFAULT]';
            try {
                const runningApps = getRunningApps(firebase.apps);
                this._app = runningApps.includes(config.name)
                    ? getRunningFirebaseApp(config.name, firebase.apps)
                    : firebase.initializeApp(config, config.name);
            }
            catch (e) {
                if (e.message && e.message.indexOf('app/duplicate-app') !== -1) {
                    console.log(`The "${config.name}" app already exists; will proceed.`);
                }
                else {
                    throw e;
                }
            }
        }
        else if (!isMockConfig(config)) {
            throw new FireError(`The configuration passed to RealTimeClient was invalid!`, `invalid-configuration`);
        }
        this._config = config;
    }
    /**
     * Uses configuration to connect to the `RealTimeDb` database using the Client SDK
     * and then returns a promise which is resolved once the _connection_ is established.
     */
    static async connect(config) {
        const obj = new RealTimeClient(config);
        await obj.connect();
        return obj;
    }
    /** lists the database names which are currently connected */
    static async connectedTo() {
        const fb = await import(
        /* webpackChunkName: 'firebase-auth' */ '@firebase/app');
        await import(
        /* webpackChunkName: 'firebase-database' */ '@firebase/database');
        return Array.from(new Set(fb.firebase.apps.map(i => i.name)));
    }
    async connect() {
        if (isMockConfig(this._config)) {
            this.connectMockDb(this._config);
        }
        else if (isClientConfig(this._config)) {
            this.connectRealDb(this._config);
        }
        else {
            throw new Error(`The configuration is of an unknown type: ${JSON.stringify(this._config)}`);
        }
        return this;
    }
    /**
     * access to provider specific providers
     */
    get authProviders() {
        if (!this._fbClass) {
            throw new ClientError(`There was a problem getting the Firebase default export/class!`);
        }
        if (!this._authProviders) {
            if (!this._fbClass.auth) {
                throw new ClientError(`Attempt to get the authProviders getter before connecting to the database!`);
            }
            this._authProviders = this._fbClass.auth;
        }
        return this._authProviders;
    }
    async auth() {
        if (this._auth) {
            return this._auth;
        }
        if (!this.isConnected) {
            this._config.useAuth = true;
            await this.connect();
        }
        if (this.isMockDb) {
            this._auth = await this.mock.auth();
            return this._auth;
        }
        if (!this._app.auth) {
        }
        this._auth = this._app.auth();
        return this._auth;
    }
    /**
     * The steps needed to connect a database to a Firemock
     * mocked DB.
     */
    async connectMockDb(config) {
        await this.getFireMock({
            db: config.mockData || {},
            auth: { providers: [], ...config.mockAuth }
        });
        this._authProviders = this._mock.authProviders;
        this._isConnected = true;
    }
    async connectRealDb(config) {
        if (!this._isConnected) {
            await this.loadDatabaseApi();
            if (config.useAuth) {
                await this.loadAuthApi();
            }
            this._database = this._app.database();
            this.listenForConnectionStatus();
        }
        else {
            console.info(`Database ${config.name} already connected`);
        }
        // TODO: relook at debugging func
        if (config.debugging) {
            this.enableDatabaseLogging(typeof config.debugging === 'function'
                ? (message) => config.debugging(message)
                : (message) => console.log('[FIREBASE]', message));
        }
    }
    async loadAuthApi() {
        await import(/* webpackChunkName: "firebase-auth" */ '@firebase/auth');
    }
    async loadDatabaseApi() {
        await import(/* webpackChunkName: "firebase-db" */ '@firebase/database');
    }
    /**
     * Sets up the listening process for connection status
     */
    listenForConnectionStatus() {
        if (!this._mocking) {
            this._database
                .ref('.info/connected')
                .on('value', snap => this._monitorConnection.bind(this)(snap));
        }
        else {
            // console.info(`Listening for connection changes on Mock DB`);
        }
    }
}
//# sourceMappingURL=RealTimeClient.js.map