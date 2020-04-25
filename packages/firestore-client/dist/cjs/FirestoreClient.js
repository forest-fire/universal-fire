"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@firebase/firestore");
const app_1 = __importDefault(require("@firebase/app"));
const firestore_db_1 = require("@forest-fire/firestore-db");
class FirestoreClient extends firestore_db_1.FirestoreDb {
    async _initializeApp(config) {
        this.app = app_1.default.initializeApp(config);
    }
    async _connect() {
        this.database = this.app.firestore();
        return this;
    }
    async auth() {
        await Promise.resolve().then(() => __importStar(require('@firebase/auth')));
        if (this.app.auth) {
            return this.app.auth();
        }
        throw new Error('Attempt to use auth module without having installed Firebase auth dependency');
    }
}
exports.FirestoreClient = FirestoreClient;
//# sourceMappingURL=FirestoreClient.js.map