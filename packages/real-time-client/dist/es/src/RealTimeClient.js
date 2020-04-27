import { EventManager } from './EventManager';
import { ClientError } from './ClientError';
import { RealTimeDb } from '@forest-fire/real-time-db';
import { isMockConfig, isClientConfig } from '@forest-fire/types';
export var FirebaseBoolean;
(function (FirebaseBoolean) {
    FirebaseBoolean[FirebaseBoolean["true"] = 1] = "true";
    FirebaseBoolean[FirebaseBoolean["false"] = 0] = "false";
})(FirebaseBoolean || (FirebaseBoolean = {}));
export let MOCK_LOADING_TIMEOUT = 200;
export class RealTimeClient extends RealTimeDb {
    constructor(config) {
        super();
        this._isAdminApi = false;
        this._config = config;
        this._eventManager = new EventManager();
        this.listenForConnectionStatus();
    }
    /**
     * Uses configuration to connect to the `RealTimeDb` database using the Client SDK
     * and then returns a promise which is resolved once the _connection_ is established.
     */
    // public static async connect(config: IClientConfig | IMockConfig) {
    //   const obj = new RealTimeClient(config);
    //   await obj.connect();
    //   return obj;
    // }
    /** lists the database names which are currently connected */
    static async connectedTo() {
        // tslint:disable-next-line:no-submodule-imports
        const fb = await import(
        /* webpackChunkName: 'firebase-auth' */ '@firebase/app');
        await import(
        /* webpackChunkName: 'firebase-database' */ '@firebase/database');
        return Array.from(new Set(fb.firebase.apps.map(i => i.name)));
    }
    async connect() {
        const config = this._config;
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
        else if (isClientConfig(config)) {
            // REAL DB
            if (!this._isConnected) {
                if (isClientConfig(config)) {
                    config.name =
                        config.name ||
                            config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1');
                }
                else {
                    throw new ClientError(`The client configuration passed into the database was not correctly formed. The configuration was:\n${JSON.stringify(config, null, 2)}`);
                }
                // tslint:disable-next-line:no-submodule-imports
                const fb = await import(
                /* webpackChunkName: "firebase-app" */ '@firebase/app');
                await import(
                /* webpackChunkName: "firebase-db" */ '@firebase/database');
                if (config.useAuth) {
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
        else {
            throw new Error(`The configuration is of an unknown type: ${JSON.stringify(config)}`);
        }
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