"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: reduce this to just named symbols which we need!
const firebase = __importStar(require("firebase-admin"));
const process = __importStar(require("process"));
const real_time_db_1 = require("@forest-fire/real-time-db");
const EventManager_1 = require("./EventManager");
const util_1 = require("./util");
const types_1 = require("@forest-fire/types");
const utility_1 = require("@forest-fire/utility");
const RealTimeAdminError_1 = require("./errors/RealTimeAdminError");
class RealTimeAdmin extends real_time_db_1.RealTimeDb {
    constructor(config = {}) {
        super();
        this._isAdminApi = true;
        this._clientType = 'admin';
        this._isAuthorized = true;
        this._eventManager = new EventManager_1.EventManager();
        this._mocking = config.mocking ? true : false;
        if (config.timeout) {
            this.CONNECTION_TIMEOUT = config.timeout || 5000;
        }
        if (types_1.isAdminConfig(config)) {
            config.serviceAccount = utility_1.extractServiceAccount(config);
            config.databaseUrl = utility_1.extractDataUrl(config);
            this._config = config;
        }
        else if (types_1.isMockConfig(config)) {
            this._mocking = true;
        }
        else {
            throw new utility_1.FireError(`The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(config, null, 2)}`, 'invalid-configuration');
        }
        this.listenForConnectionStatus();
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
        return firebase.auth();
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
    async connect() {
        if (types_1.isMockConfig(this._config)) {
            // MOCK DB
            await this.getFireMock({
                db: this._config.mockData || {},
                auth: { providers: [], ...this._config.mockAuth }
            });
            this._isConnected = true;
        }
        else {
            if (this._isConnected && this.app) {
                this.goOnline();
                new EventManager_1.EventManager().connection(true);
                return this;
            }
            if (this._isAuthorized) {
                console.log(`already authorized`);
                return this;
            }
            if (types_1.isAdminConfig(this._config)) {
                console.log(`Connecting to Firebase: [${process.env['FIREBASE_DATABASE_URL']}]`);
                try {
                    const name = this._config.name || '[DEFAULT]';
                    const apps = utility_1.runningApps(firebase.apps);
                    const serviceAccount = this._config.serviceAccount;
                    const databaseURL = this._config.databaseUrl;
                    util_1.debug(`abstracted-admin: the DB "${name}" ` + apps.includes(name)
                        ? 'appears to be already connected'
                        : 'has not yet been connected');
                    this.app = apps.includes(name)
                        ? firebase.app()
                        : firebase.initializeApp({
                            credential: firebase.credential.cert(serviceAccount),
                            databaseURL
                        });
                    this._isAuthorized = true;
                    this._database = firebase.database();
                    this.enableDatabaseLogging = firebase.database.enableLogging.bind(firebase.database);
                    this.app = firebase;
                    this.goOnline();
                    new EventManager_1.EventManager().connection(true);
                }
                catch (err) {
                    if (err.message.indexOf('The default Firebase app already exists.') !==
                        -1) {
                        console.warn('DB was already logged in, however flag had not been set!');
                        this._isConnected = true;
                    }
                    else {
                        this._isConnected = false;
                        console.warn('Problem connecting to Firebase', err);
                        throw new Error(err);
                    }
                }
            }
            else {
                throw new RealTimeAdminError_1.RealTimeAdminError('The configuation passed is not valid for an admin SDK!', 'invalid-configuration');
            }
        }
        if (this._config.debugging) {
            this.enableDatabaseLogging(typeof this._config.debugging === 'function'
                ? (message) => this._config.debugging(message)
                : (message) => console.log('[FIREBASE]', message));
        }
        return this;
    }
    /**
     * listenForConnectionStatus
     *
     * in the admin interface we assume that ONCE connected
     * we remain connected; this is unlike the client API
     * which provides an endpoint to lookup
     */
    listenForConnectionStatus() {
        this._isConnected = true;
        this._eventManager.connection(true);
    }
}
exports.RealTimeAdmin = RealTimeAdmin;
//# sourceMappingURL=RealTimeAdmin.js.map