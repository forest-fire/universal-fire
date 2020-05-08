"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase = __importStar(require("firebase-admin"));
const firestore_db_1 = require("@forest-fire/firestore-db");
const utility_1 = require("@forest-fire/utility");
const types_1 = require("@forest-fire/types");
class FirestoreAdmin extends firestore_db_1.FirestoreDb {
    constructor(config) {
        super();
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
            this.app = runningApps.includes(config.name)
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
    get app() {
        if (this._app) {
            return this._app;
        }
        throw new utility_1.FireError('Attempt to access Firebase App without having instantiated it');
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
        await Promise.resolve().then(() => __importStar(require(/* webpackChunkName: "firebase-admin" */ 'firebase-admin')));
    }
}
exports.FirestoreAdmin = FirestoreAdmin;
//# sourceMappingURL=FirestoreAdmin.js.map