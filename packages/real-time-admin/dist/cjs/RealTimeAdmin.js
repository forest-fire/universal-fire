"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeAdmin = void 0;
// TODO: reduce this to just named symbols which we need!
const firebase = __importStar(require("firebase-admin"));
const real_time_db_1 = require("@forest-fire/real-time-db");
const EventManager_1 = require("./EventManager");
const util_1 = require("./util");
const types_1 = require("@forest-fire/types");
const utility_1 = require("@forest-fire/utility");
const RealTimeAdminError_1 = require("./errors/RealTimeAdminError");
const firemock_1 = require("firemock");
let RealTimeAdmin = /** @class */ (() => {
    class RealTimeAdmin extends real_time_db_1.RealTimeDb {
        constructor(config) {
            super();
            this._clientType = 'admin';
            this._isAuthorized = true;
            this._isAdminApi = true;
            this._eventManager = new EventManager_1.EventManager();
            this.CONNECTION_TIMEOUT = config ? config.timeout || 5000 : 5000;
            if (!config) {
                config = {
                    serviceAccount: utility_1.extractServiceAccount(config),
                    databaseURL: utility_1.extractDataUrl(config),
                };
            }
            if (types_1.isAdminConfig(config)) {
                config.serviceAccount =
                    config.serviceAccount || utility_1.extractServiceAccount(config);
                config.databaseURL = config.databaseURL || utility_1.extractDataUrl(config);
                config.name = utility_1.determineDefaultAppName(config);
                this._config = config;
                const runningApps = utility_1.getRunningApps(firebase.apps);
                const credential = firebase.credential.cert(config.serviceAccount);
                this.app = runningApps.includes(config.name)
                    ? utility_1.getRunningFirebaseApp(config.name, firebase.apps)
                    : firebase.initializeApp({
                        credential,
                        databaseURL: config.databaseURL,
                    }, config.name);
            }
            else if (types_1.isMockConfig(config)) {
                config.name = utility_1.determineDefaultAppName(config);
                this._config = config;
            }
            else {
                throw new utility_1.FireError(`The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(config, null, 2)}`, 'invalid-configuration');
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
            return RealTimeAdmin._connections;
        }
        static addConnection(app) {
            if (RealTimeAdmin._connections[app.name]) {
                throw new RealTimeAdminError_1.RealTimeAdminError(`Attempt to add app with name that already exists! [${app.name}]`, 'not-allowed');
            }
            RealTimeAdmin._connections[app.name] = app;
        }
        get app() {
            if (this._app) {
                return this._app;
            }
            throw new utility_1.FireError('Attempt to access Firebase App without having instantiated it');
        }
        set app(value) {
            this._app = value;
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
                return firemock_1.adminAuthSdk;
            }
            return firebase.auth(this._app);
        }
        goOnline() {
            if (this._database) {
                try {
                    this._database.goOnline();
                }
                catch (e) {
                    util_1.debug('There was an error going online:' + e);
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
            return (this.app &&
                this.config &&
                this.config.name &&
                utility_1.getRunningApps(firebase.apps).includes(this.config.name));
        }
        async connect() {
            if (types_1.isMockConfig(this._config)) {
                await this._connectMockDb(this._config);
            }
            else if (types_1.isAdminConfig(this._config)) {
                await this._connectRealDb(this._config);
            }
            else {
                throw new RealTimeAdminError_1.RealTimeAdminError('The configuation passed is not valid for an admin SDK!', 'invalid-configuration');
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
            this._database = (found
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
    RealTimeAdmin._connections = {};
    return RealTimeAdmin;
})();
exports.RealTimeAdmin = RealTimeAdmin;
//# sourceMappingURL=RealTimeAdmin.js.map