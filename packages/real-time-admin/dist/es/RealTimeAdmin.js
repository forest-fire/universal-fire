// TODO: reduce this to just named symbols which we need!
import * as firebase from 'firebase-admin';
import { RealTimeDb } from '@forest-fire/real-time-db';
import { EventManager } from './EventManager';
import { debug } from './util';
import { isMockConfig, isAdminConfig, } from '@forest-fire/types';
import { extractServiceAccount, FireError, getRunningApps, extractDataUrl, getRunningFirebaseApp, determineDefaultAppName, } from '@forest-fire/utility';
import { RealTimeAdminError } from './errors/RealTimeAdminError';
import { adminAuthSdk } from 'firemock';
let RealTimeAdmin = /** @class */ (() => {
    class RealTimeAdmin extends RealTimeDb {
        constructor(config) {
            super();
            this._clientType = 'admin';
            this._isAuthorized = true;
            this._isAdminApi = true;
            this._eventManager = new EventManager();
            this.CONNECTION_TIMEOUT = config ? config.timeout || 5000 : 5000;
            if (!config) {
                config = {
                    serviceAccount: extractServiceAccount(config),
                    databaseURL: extractDataUrl(config),
                };
            }
            if (isAdminConfig(config)) {
                config.serviceAccount =
                    config.serviceAccount || extractServiceAccount(config);
                config.databaseURL = config.databaseURL || extractDataUrl(config);
                config.name = determineDefaultAppName(config);
                this._config = config;
                const runningApps = getRunningApps(firebase.apps);
                const credential = firebase.credential.cert(config.serviceAccount);
                this.app = runningApps.includes(config.name)
                    ? getRunningFirebaseApp(config.name, firebase.apps)
                    : firebase.initializeApp({
                        credential,
                        databaseURL: config.databaseURL,
                    }, config.name);
            }
            else if (isMockConfig(config)) {
                config.name = determineDefaultAppName(config);
                this._config = config;
            }
            else {
                throw new FireError(`The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(config, null, 2)}`, 'invalid-configuration');
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
                throw new RealTimeAdminError(`Attempt to add app with name that already exists! [${app.name}]`, 'not-allowed');
            }
            RealTimeAdmin._connections[app.name] = app;
        }
        get app() {
            if (this._app) {
                return this._app;
            }
            throw new FireError('Attempt to access Firebase App without having instantiated it');
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
                return adminAuthSdk;
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
            return (this.app &&
                this.config &&
                this.config.name &&
                getRunningApps(firebase.apps).includes(this.config.name));
        }
        async connect() {
            if (isMockConfig(this._config)) {
                await this._connectMockDb(this._config);
            }
            else if (isAdminConfig(this._config)) {
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
    RealTimeAdmin._connections = {};
    return RealTimeAdmin;
})();
export { RealTimeAdmin };
//# sourceMappingURL=RealTimeAdmin.js.map