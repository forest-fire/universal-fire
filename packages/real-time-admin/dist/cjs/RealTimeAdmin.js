'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var firebase = _interopDefault(require('firebase-admin'));
var realTimeDb = require('@forest-fire/real-time-db');
var events = require('events');
var types = require('@forest-fire/types');
var utility = require('@forest-fire/utility');
var firemock = require('firemock');

class EventManager extends events.EventEmitter {
    connection(state) {
        this.emit('connection', state);
    }
}

function debug(msg, stack) {
    if (process.env.DEBUG) {
        console.log(msg);
        if (stack) {
            console.log(JSON.stringify(stack));
        }
    }
}

class RealTimeAdminError extends utility.FireError {
    constructor(message, classification = 'RealTimeAdmin/error', statusCode = 400) {
        super(message, classification, statusCode);
        this.kind = 'RealTimeAdminError';
    }
}

// TODO: reduce this to just named symbols which we need!
let RealTimeAdmin = /** @class */ (() => {
    class RealTimeAdmin extends realTimeDb.RealTimeDb {
        constructor(config) {
            super();
            this.sdk = "RealTimeAdmin" /* RealTimeAdmin */;
            this._clientType = 'admin';
            this._isAuthorized = true;
            this._isAdminApi = true;
            this._eventManager = new EventManager();
            this.CONNECTION_TIMEOUT = config ? config.timeout || 5000 : 5000;
            config = {
                ...config,
                serviceAccount: utility.extractServiceAccount(config),
                databaseURL: utility.extractDataUrl(config),
                name: utility.determineDefaultAppName(config),
            };
            if (types.isAdminConfig(config)) {
                this._config = config;
                const runningApps = utility.getRunningApps(firebase.apps);
                RealTimeAdmin._connections = firebase.apps;
                const credential = firebase.credential.cert(config.serviceAccount);
                this._app = runningApps.includes(this._config.name)
                    ? utility.getRunningFirebaseApp(config.name, firebase.apps)
                    : firebase.initializeApp({
                        credential,
                        databaseURL: config.databaseURL,
                    }, config.name);
            }
            else if (types.isMockConfig(config)) {
                this._config = config;
            }
            else {
                throw new utility.FireError(`The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(config, null, 2)}`, 'invalid-configuration');
            }
        }
        /**
         * Instantiates a DB and then waits for the connection
         * to finish before resolving the promise.
         */
        static async connect(config) {
            const obj = new RealTimeAdmin(config);
            await obj.connect();
            return obj;
        }
        static get connections() {
            return RealTimeAdmin._connections.map((i) => i.name);
        }
        get database() {
            if (this.config.mocking) {
                throw new RealTimeAdminError(`The "database" provides direct access to the Firebase database API when using a real database but not when using a Mock DB!`, 'not-allowed');
            }
            if (!this._database) {
                throw new RealTimeAdminError(`The "database" object was accessed before it was established as part of the "connect()" process!`, 'not-allowed');
            }
            return this._database;
        }
        /**
         * Provides access to the Firebase Admin Auth API.
         *
         * > If using a _mocked_ database then the Auth API will be redirected to **firemock**
         * instead of the real Admin SDK for Auth. Be aware that this mocked API may not be fully implemented
         * but PR's are welcome if the part you need is not yet implemented. If you want to explicitly state
         * whether to use the _real_ or _mock_ Auth SDK then you can state this by passing in a `auth` parameter
         * as part of the configuration (using either "real" or "mocked" as a value)
         *
         * References:
         * - [Introduction](https://firebase.google.com/docs/auth/admin)
         * - [API](https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth)
         */
        async auth() {
            if (this._config.mocking) {
                return firemock.adminAuthSdk;
            }
            return firebase.auth(this._app);
        }
        goOnline() {
            if (this._database) {
                try {
                    this._database.goOnline();
                }
                catch (e) {
                    debug('There was an error going online:' + e);
                }
            }
            else {
                console.warn('Attempt to use goOnline() prior to having a database connection!');
            }
        }
        goOffline() {
            if (this._database) {
                this._database.goOffline();
            }
            else {
                console.warn('Attempt to use goOffline() prior to having a database connection!');
            }
        }
        get isConnected() {
            if (this.isMockDb) {
                return this._isConnected;
            }
            return (this._app &&
                this.config &&
                this.config.name &&
                utility.getRunningApps(firebase.apps).includes(this.config.name));
        }
        async connect() {
            if (types.isMockConfig(this._config)) {
                await this._connectMockDb(this._config);
            }
            else if (types.isAdminConfig(this._config)) {
                await this._connectRealDb(this._config);
            }
            else {
                throw new RealTimeAdminError('The configuation passed is not valid for an admin SDK!', 'invalid-configuration');
            }
            return this;
        }
        async _connectMockDb(config) {
            await this.getFireMock({
                db: config.mockData || {},
                auth: { providers: [], ...config.mockAuth },
            });
            this._isConnected = true;
            return this;
        }
        async _connectRealDb(config) {
            const found = firebase.apps.find((i) => i.name === this.config.name);
            this._database = (found &&
                found.database &&
                typeof found.database !== 'function'
                ? found.database
                : this._app.database());
            this.enableDatabaseLogging = firebase.database.enableLogging.bind(firebase.database);
            this.goOnline();
            this._eventManager.connection(true);
            await this._listenForConnectionStatus();
            if (this.isConnected) {
                console.info(`Database ${this.app.name} was already connected. Reusing connection.`);
            }
        }
        /**
         * listenForConnectionStatus
         *
         * in the admin interface we assume that ONCE connected
         * we remain connected; this is unlike the client API
         * which provides an endpoint to lookup
         */
        async _listenForConnectionStatus() {
            this._setupConnectionListener();
            this._eventManager.connection(true);
        }
    }
    RealTimeAdmin._connections = [];
    return RealTimeAdmin;
})();

exports.RealTimeAdmin = RealTimeAdmin;