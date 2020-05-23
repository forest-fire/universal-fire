"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeClient = exports.MOCK_LOADING_TIMEOUT = void 0;
require("@firebase/auth");
require("@firebase/database");
const private_1 = require("./private");
const utility_1 = require("@forest-fire/utility");
const types_1 = require("@forest-fire/types");
const real_time_db_1 = require("@forest-fire/real-time-db");
const app_1 = require("@firebase/app");
const common_types_1 = require("common-types");
exports.MOCK_LOADING_TIMEOUT = 200;
class RealTimeClient extends real_time_db_1.RealTimeDb {
    /**
     * Builds the client and then waits for all to `connect()` to
     * start the connection process.
     */
    constructor(config) {
        super();
        this.sdk = "RealTimeClient" /* RealTimeClient */;
        this._isAdminApi = false;
        this._eventManager = new private_1.EventManager();
        this.CONNECTION_TIMEOUT = config ? config.timeout || 5000 : 5000;
        if (!config) {
            config = utility_1.extractClientConfig();
            if (!config) {
                throw new utility_1.FireError(`The client configuration was not set. Either set in the code or use the environment variables!`, `invalid-configuration`);
            }
        }
        config.name = utility_1.determineDefaultAppName(config);
        if (types_1.isClientConfig(config)) {
            try {
                const runningApps = utility_1.getRunningApps(app_1.firebase.apps);
                this._app = runningApps.includes(config.name)
                    ? utility_1.getRunningFirebaseApp(config.name, app_1.firebase.apps)
                    : app_1.firebase.initializeApp(config, config.name);
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
        else if (!types_1.isMockConfig(config)) {
            throw new utility_1.FireError(`The configuration passed to RealTimeClient was invalid!`, `invalid-configuration`);
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
        return Array.from(new Set(app_1.firebase.apps.map((i) => i.name)));
    }
    async connect() {
        if (types_1.isMockConfig(this._config)) {
            await this._connectMockDb(this._config);
        }
        else if (types_1.isClientConfig(this._config)) {
            await this._connectRealDb(this._config);
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
            throw new private_1.ClientError(`There was a problem getting the Firebase default export/class!`, 'missing-firebase');
        }
        if (!this._authProviders) {
            if (!this._fbClass.auth) {
                throw new private_1.ClientError(`Attempt to get the authProviders getter before connecting to the database!`, 'missing-auth');
            }
            this._authProviders = app_1.firebase.auth;
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
        this._auth = this._app.auth();
        return this._auth;
    }
    /**
     * The steps needed to connect a database to a Firemock
     * mocked DB.
     */
    async _connectMockDb(config) {
        await this.getFireMock({
            db: config.mockData || {},
            auth: { providers: [], ...config.mockAuth },
        });
        this._authProviders = this._mock.authProviders;
        await this._listenForConnectionStatus();
    }
    async _connectRealDb(config) {
        if (!this._isConnected) {
            // await this.loadDatabaseApi();
            this._database = app_1.firebase.database(this._app);
            if (config.useAuth) {
                // await this.loadAuthApi();
                this._auth = this._app.auth();
            }
            await this._listenForConnectionStatus();
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
    /**
     * Sets up the listening process for connection status.
     *
     * In addition, will return a promise which resolves at the point
     * the database connects for the first time.
     */
    async _listenForConnectionStatus() {
        this._setupConnectionListener();
        if (!this.isMockDb) {
            // setup ongoing listener
            this.database
                .ref('.info/connected')
                .on('value', (snap) => this._monitorConnection.bind(this)(snap));
            // detect connection
            if (!this._isConnected)
                await this._detectConnection();
        }
        else {
            this._eventManager.connection(true);
        }
        this._isConnected = true;
    }
    async _detectConnection() {
        const connectionEvent = () => {
            try {
                return new Promise((resolve, reject) => {
                    this._eventManager.once('connection', (state) => {
                        if (state) {
                            resolve();
                        }
                        else {
                            reject(new private_1.ClientError(`While waiting for a connection received a disconnect message instead`, `no-connection`));
                        }
                    });
                });
            }
            catch (e) {
                throw e;
            }
        };
        const timeout = async () => {
            await common_types_1.wait(this.CONNECTION_TIMEOUT);
            throw new private_1.ClientError(`The database didn't connect after the allocated period of ${this.CONNECTION_TIMEOUT}ms`, 'connection-timeout');
        };
        await Promise.race([connectionEvent(), timeout()]);
    }
}
exports.RealTimeClient = RealTimeClient;
//# sourceMappingURL=RealTimeClient.js.map