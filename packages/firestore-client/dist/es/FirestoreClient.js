import { firebase } from '@firebase/app';
import { FirestoreDb } from '@forest-fire/firestore-db';
import { isClientConfig, isMockConfig, } from '@forest-fire/types';
import { extractClientConfig, FireError, getRunningApps, getRunningFirebaseApp, } from '@forest-fire/utility';
export class FirestoreClient extends FirestoreDb {
    constructor(config) {
        super();
        this._isAdminApi = false;
        if (!config) {
            config = extractClientConfig();
            if (!config) {
                throw new FireError(`The client configuration was not set. Either set in the code or use the environment variables!`, `invalid-configuration`);
            }
        }
        if (isMockConfig(config)) {
            throw new FireError(`Mock is not supported by Firestore`, `invalid-configuration`);
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
        else {
            throw new FireError(`The configuration passed to FiresotreClient was invalid`, `invalid-configuration`);
        }
        this._config = config;
    }
    static async connect(config) {
        const obj = new FirestoreClient(config);
        await obj.connect();
        return obj;
    }
    async connect() {
        if (this._isConnected) {
            console.info(`Database ${this.config.name} already connected`);
            return this;
        }
        await this.loadFirestoreApi();
        if (this.config.useAuth) {
            await this.loadAuthApi();
        }
        // @ts-ignore
        this._database = this.app.firestore();
        return this;
    }
    async auth() {
        if (this._auth) {
            return this._auth;
        }
        if (!this.isConnected) {
            this._config.useAuth = true;
            await this.connect();
        }
        if (!this.app.auth) {
            await this.loadAuthApi();
        }
        this._auth = this.app.auth();
        return this._auth;
    }
    async loadAuthApi() {
        await import(/* webpackChunkName: "firebase-auth" */ '@firebase/auth');
    }
    async loadFirestoreApi() {
        await import(
        /* webpackChunkName: "firebase-firestore" */ '@firebase/firestore');
    }
}
//# sourceMappingURL=FirestoreClient.js.map