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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeAdmin = exports.FirestoreAdmin = void 0;
var real_time_client_1 = require("@forest-fire/real-time-client");
Object.defineProperty(exports, "RealTimeClient", { enumerable: true, get: function () { return real_time_client_1.RealTimeClient; } });
var firestore_client_1 = require("@forest-fire/firestore-client");
Object.defineProperty(exports, "FirestoreClient", { enumerable: true, get: function () { return firestore_client_1.FirestoreClient; } });
class FirestoreAdmin {
    static async connect() {
        const admin = (await Promise.resolve().then(() => __importStar(require('@forest-fire/firestore-admin'))));
        return admin.connect();
    }
}
exports.FirestoreAdmin = FirestoreAdmin;
class RealTimeAdmin {
    static async connect() {
        const admin = (await Promise.resolve().then(() => __importStar(require('@forest-fire/real-time-admin'))));
        return admin.connect();
    }
}
exports.RealTimeAdmin = RealTimeAdmin;
//# sourceMappingURL=sdks.js.map