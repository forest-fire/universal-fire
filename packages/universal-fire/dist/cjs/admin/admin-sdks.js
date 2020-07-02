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
//# sourceMappingURL=admin-sdks.js.map