'use strict';

Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreAdmin = void 0;
const firebase = require("firebase-admin");
const firestore_db_1 = require("@forest-fire/firestore-db");
const utility_1 = require("@forest-fire/utility");
const types_1 = require("@forest-fire/types");
class FirestoreAdmin extends firestore_db_1.FirestoreDb {
    constructor(config) {
        super();
        this.sdk = "FirestoreAdmin" /* FirestoreAdmin */;
        this._isAdminApi = true;
        if (types_1.isMockConfig(config)) {
            throw new utility_1.FireError(`Mock is not supported by Firestore`, `invalid-configuration`);
        }
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
            this._app = runningApps.includes(config.name)
                ? utility_1.getRunningFirebaseApp(config.name, firebase.apps)
                : firebase.initializeApp({
                    credential,
                    databaseURL: config.databaseURL,
                }, config.name);
        }
        else {
            throw new utility_1.FireError(`The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(config, null, 2)}`, 'invalid-configuration');
        }
        this._config = config;
    }
    static async connect(config) {
        const obj = new FirestoreAdmin(config);
        await obj.connect();
        return obj;
    }
    async connect() {
        if (this._isConnected) {
            console.info(`Firestore ${this.config.name} already connected`);
            return this;
        }
        await this.loadFirestoreApi();
        this.database = this._app.firestore();
    }
    async auth() {
        return firebase.auth(this._app);
    }
    async loadFirestoreApi() {
        await Promise.resolve().then(() => require(/* webpackChunkName: "firebase-admin" */ 'firebase-admin'));
    }
}
exports.FirestoreAdmin = FirestoreAdmin;
//# sourceMappingURL=FirestoreAdmin.js.map
