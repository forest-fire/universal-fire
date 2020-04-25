"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventManager_1 = require("./EventManager");
const ClientError_1 = require("./ClientError");
const real_time_db_1 = require("@forest-fire/real-time-db");
var FirebaseBoolean;
(function (FirebaseBoolean) {
    FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
    FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean = exports.FirebaseBoolean || (exports.FirebaseBoolean = {}));
exports.MOCK_LOADING_TIMEOUT = 200;
class RealTimeClient extends real_time_db_1.RealTimeDb {
    constructor(config) {
        super(config);
        this._isAdminApi = false;
        this._config = config;
        this._eventManager = new EventManager_1.EventManager();
    }
    /**
     * Uses configuration to connect to the `RealTimeDb` database using the Client SDK
     * and then returns a promise which is resolved once the _connection_ is established.
     */
    static async connect(config) {
        const obj = new RealTimeClient(config);
        return obj.connect();
    }
    /** lists the database names which are currently connected */
    static async connectedTo() {
        // tslint:disable-next-line:no-submodule-imports
        const fb = await Promise.resolve().then(() => __importStar(require('@firebase/app')));
        await Promise.resolve().then(() => __importStar(require('@firebase/database')));
        return Array.from(new Set(fb.firebase.apps.map(i => i.name)));
    }
    /**
     * access to provider specific providers
     */
    get authProviders() {
        if (!this._fbClass) {
            throw new ClientError_1.ClientError(`There was a problem getting the Firebase default export/class!`);
        }
        if (!this._authProviders) {
            if (!this._fbClass.auth) {
                throw new ClientError_1.ClientError(`Attempt to get the authProviders getter before connecting to the database!`);
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
            await this.connect();
        }
        if (this._mocking) {
            this._auth = await this.mock.auth();
            return this._auth;
        }
        this._auth = this.app.auth();
        return this._auth;
    }
    /**
     * connect
     *
     * Asynchronously loads the firebase/app library and then
     * initializes a connection to the database.
     */
    async connectToFirebase(config, useAuth = true) {
        if (real_time_db_1.isMockConfig(config)) {
            // MOCK DB
            await this.getFireMock({
                db: config.mockData || {},
                auth: { providers: [], ...config.mockAuth }
            });
            this._authProviders = this._mock
                .authProviders;
            this._isConnected = true;
        }
        else {
            // REAL DB
            if (!this._isConnected) {
                if (process.env['FIREBASE_CONFIG']) {
                    config = { ...config, ...JSON.parse(process.env['FIREBASE_CONFIG']) };
                }
                config = config;
                if (!config.apiKey || !config.authDomain || !config.databaseURL) {
                    throw new Error('Trying to connect without appropriate firebase configuration!');
                }
                config.name =
                    config.name ||
                        config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1');
                // tslint:disable-next-line:no-submodule-imports
                const fb = await Promise.resolve().then(() => __importStar(require(
                /* webpackChunkName: "firebase-app" */ '@firebase/app')));
                await Promise.resolve().then(() => __importStar(require(
                /* webpackChunkName: "firebase-db" */ '@firebase/database')));
                if (useAuth) {
                    await Promise.resolve().then(() => __importStar(require(
                    /* webpackChunkName: "firebase-auth" */ '@firebase/auth')));
                }
                try {
                    const runningApps = new Set(fb.firebase.apps.map(i => i.name));
                    this.app = runningApps.has(config.name)
                        ? // TODO: does this connect to the right named DB?
                            fb.firebase.app(config.name)
                        : fb.firebase.initializeApp(config, config.name);
                }
                catch (e) {
                    if (e.message && e.message.indexOf('app/duplicate-app') !== -1) {
                        console.log(`The "${config.name}" app already exists; will proceed.`);
                        this._isConnected = true;
                    }
                    else {
                        throw e;
                    }
                }
                this._fbClass = fb.default;
                this._database = this.app.database();
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
exports.RealTimeClient = RealTimeClient;
//# sourceMappingURL=RealTimeClient.js.map