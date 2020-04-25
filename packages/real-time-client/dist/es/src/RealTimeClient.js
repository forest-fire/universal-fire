import { EventManager } from './EventManager';
import { ClientError } from './ClientError';
import { RealTimeDb, isMockConfig } from '@forest-fire/real-time-db';
export var FirebaseBoolean;
(function (FirebaseBoolean) {
    FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
    FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean || (FirebaseBoolean = {}));
export let MOCK_LOADING_TIMEOUT = 200;
export class RealTimeClient extends RealTimeDb {
    constructor(config) {
        super(config);
        this._isAdminApi = false;
        this._config = config;
        this._eventManager = new EventManager();
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
        const fb = await import('@firebase/app');
        await import('@firebase/database');
        return Array.from(new Set(fb.firebase.apps.map(i => i.name)));
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
        if (isMockConfig(config)) {
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
                const fb = await import(
                /* webpackChunkName: "firebase-app" */ '@firebase/app');
                await import(
                /* webpackChunkName: "firebase-db" */ '@firebase/database');
                if (useAuth) {
                    await import(
                    /* webpackChunkName: "firebase-auth" */ '@firebase/auth');
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
//# sourceMappingURL=RealTimeClient.js.map