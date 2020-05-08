import * as firebase from 'firebase-admin';
import { FirestoreDb } from '@forest-fire/firestore-db';
import { determineDefaultAppName, extractDataUrl, extractServiceAccount, FireError, getRunningApps, getRunningFirebaseApp, } from '@forest-fire/utility';
import { isAdminConfig, isMockConfig } from '@forest-fire/types';
export class FirestoreAdmin extends FirestoreDb {
    constructor(config) {
        super();
        this._isAdminApi = true;
        if (isMockConfig(config)) {
            throw new FireError(`Mock is not supported by Firestore`, `invalid-configuration`);
        }
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
        else {
            throw new FireError(`The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(config, null, 2)}`, 'invalid-configuration');
        }
        this._config = config;
    }
    static async connect(config) {
        const obj = new FirestoreAdmin(config);
        await obj.connect();
        return obj;
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
    async connect() {
        if (this._isConnected) {
            console.info(`Firestore ${this.config.name} already connected`);
            return this;
        }
        await this.loadFirestoreApi();
        this.database = this.app.firestore();
    }
    async auth() {
        return firebase.auth(this.app);
    }
    async loadFirestoreApi() {
        await import(/* webpackChunkName: "firebase-admin" */ 'firebase-admin');
    }
}
//# sourceMappingURL=FirestoreAdmin.js.map