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
exports.FirestoreClient = void 0;
const app_1 = require("@firebase/app");
const firestore_db_1 = require("@forest-fire/firestore-db");
const types_1 = require("@forest-fire/types");
const utility_1 = require("@forest-fire/utility");
class FirestoreClient extends firestore_db_1.FirestoreDb {
    constructor(config) {
        super();
        this._isAdminApi = false;
        if (!config) {
            config = utility_1.extractClientConfig();
            if (!config) {
                throw new utility_1.FireError(`The client configuration was not set. Either set in the code or use the environment variables!`, `invalid-configuration`);
            }
        }
        if (types_1.isMockConfig(config)) {
            throw new utility_1.FireError(`Mock is not supported by Firestore`, `invalid-configuration`);
        }
        if (types_1.isClientConfig(config)) {
            config.name =
                config.name || config.databaseURL
                    ? config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1')
                    : '[DEFAULT]';
            try {
                const runningApps = utility_1.getRunningApps(app_1.firebase.apps);
                this._app = runningApps.includes(config.name)
                    ? utility_1.getRunningFirebaseApp(config.name, app_1.firebase.apps)
                    : app_1.firebase.initializeApp(config, config.name);
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
            throw new utility_1.FireError(`The configuration passed to FiresotreClient was invalid`, `invalid-configuration`);
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
            console.info(`Firestore ${this.config.name} already connected`);
            return this;
        }
        await this.loadFirestoreApi();
        if (this.config.useAuth) {
            await this.loadAuthApi();
        }
        this.database = this._app.firestore();
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
        if (!this._app.auth) {
            await this.loadAuthApi();
        }
        this._auth = this._app.auth();
        return this._auth;
    }
    async loadAuthApi() {
        await Promise.resolve().then(() => __importStar(require(/* webpackChunkName: "firebase-auth" */ '@firebase/auth')));
    }
    async loadFirestoreApi() {
        await Promise.resolve().then(() => __importStar(require(
        /* webpackChunkName: "firebase-firestore" */ '@firebase/firestore')));
    }
}
exports.FirestoreClient = FirestoreClient;
//# sourceMappingURL=FirestoreClient.js.map