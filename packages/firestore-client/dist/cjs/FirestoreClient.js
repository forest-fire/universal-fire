"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("@firebase/app");
const firestore_db_1 = require("@forest-fire/firestore-db");
const types_1 = require("@forest-fire/types");
class FirestoreClient extends firestore_db_1.FirestoreDb {
    constructor(config) {
        super();
        this._isAdminApi = false;
        if (types_1.isClientConfig(config)) {
            this._app = app_1.firebase.initializeApp(config);
        }
        this._config = config;
    }
    async connect() {
        // TODO: explain rationale of async import
        //  1. delay parsing JS until ready to connect
        //  2. provide bundling that helps users to understand cost of various deps
        //  3. _might_ make non-bocking resource where would have been blocking
        await Promise.resolve().then(() => __importStar(require(
        /* webpackChunkName: 'firebase-firestore' */ '@firebase/firestore')));
        this._database = this._app?.firestore();
        // TODO: implement a way to validate when connection is established
    }
    async auth() {
        await Promise.resolve().then(() => __importStar(require(/* webpackChunkName: 'firebase-auth' */ '@firebase/auth')));
        if (this.app?.auth) {
            return this.app.auth();
        }
        throw new Error('Attempt to use auth module without having installed Firebase auth dependency');
    }
}
exports.FirestoreClient = FirestoreClient;
//# sourceMappingURL=FirestoreClient.js.map