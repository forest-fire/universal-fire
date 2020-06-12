'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('@firebase/auth');
require('@firebase/database');
var utility = require('@forest-fire/utility');
var commonTypes = require('common-types');
var events = require('events');
var types = require('@forest-fire/types');
var realTimeDb = require('@forest-fire/real-time-db');
var app = require('@firebase/app');

class ClientError extends utility.FireError {
    constructor(
    /** a human friendly error message */
    message, 
    /**
     * either of the syntax `type/subType` or alternatively just
     * `subType` where type will be defaulted to **RealTimeDb**
     */
    classification, 
    /**
     * A numeric HTTP status code; defaults to 400 if not stated
     */
    httpStatusCode = commonTypes.HttpStatusCodes.BadRequest) {
        super(message, classification.includes('/')
            ? classification
            : `RealTimeClient/${classification}`, httpStatusCode);
    }
}

class EventManager extends events.EventEmitter {
    connection(state) {
        this.emit('connection', state);
    }
}

class RealTimeClient extends realTimeDb.RealTimeDb {
    /**
     * Builds the client and then waits for all to `connect()` to
     * start the connection process.
     */
    constructor(config) {
        super();
        this.sdk = "RealTimeClient" /* RealTimeClient */;
        this._isAdminApi = false;
        this._eventManager = new EventManager();
        this.CONNECTION_TIMEOUT = config ? config.timeout || 5000 : 5000;
        if (!config) {
            config = utility.extractClientConfig();
            if (!config) {
                throw new utility.FireError(`The client configuration was not set. Either set in the code or use the environment variables!`, `invalid-configuration`);
            }
        }
        config.name = utility.determineDefaultAppName(config);
        if (types.isClientConfig(config)) {
            try {
                const runningApps = utility.getRunningApps(app.firebase.apps);
                this._app = runningApps.includes(config.name)
                    ? utility.getRunningFirebaseApp(config.name, app.firebase.apps)
                    : app.firebase.initializeApp(config, config.name);
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
        else if (!types.isMockConfig(config)) {
            throw new utility.FireError(`The configuration passed to RealTimeClient was invalid!`, `invalid-configuration`);
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
        return Array.from(new Set(app.firebase.apps.map((i) => i.name)));
    }
    async connect() {
        if (types.isMockConfig(this._config)) {
            await this._connectMockDb(this._config);
        }
        else if (types.isClientConfig(this._config)) {
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
            throw new ClientError(`There was a problem getting the Firebase default export/class!`, 'missing-firebase');
        }
        if (!this._authProviders) {
            if (!this._fbClass.auth) {
                throw new ClientError(`Attempt to get the authProviders getter before connecting to the database!`, 'missing-auth');
            }
            this._authProviders = app.firebase.auth;
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
            this._database = app.firebase.database(this._app);
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
                            reject(new ClientError(`While waiting for a connection received a disconnect message instead`, `no-connection`));
                        }
                    });
                });
            }
            catch (e) {
                throw e;
            }
        };
        const timeout = async () => {
            await commonTypes.wait(this.CONNECTION_TIMEOUT);
            throw new ClientError(`The database didn't connect after the allocated period of ${this.CONNECTION_TIMEOUT}ms`, 'connection-timeout');
        };
        await Promise.race([connectionEvent(), timeout()]);
    }
}

exports.RealTimeClient = RealTimeClient;
