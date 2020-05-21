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
exports.DB = void 0;
const utility_1 = require("@forest-fire/utility");
class DB {
    /**
     * A static initializer which can hand back any of the supported SDK's for either
     * Firestore or Real-Time Database.
     *
     * @param sdk The Firebase SDK which will be used to connect
     * @param config The database configuration
     *
     */
    static async connect(sdk, config) {
        const constructor = extractConstructor(await Promise.resolve().then(() => __importStar(require(`@forest-fire/${sdk}`))));
        switch (sdk) {
            case "RealTimeAdmin" /* RealTimeAdmin */:
                return new constructor(config).connect();
            case "RealTimeClient" /* RealTimeClient */:
                return new constructor(config).connect();
            case "FirestoreAdmin" /* FirestoreAdmin */:
                return new constructor(config).connect();
            case "FirestoreClient" /* FirestoreClient */:
                return new constructor(config).connect();
            default:
                throw new utility_1.FireError(`The SDK requested "${sdk}", is an unknown type!`, 'invalid-sdk');
        }
    }
}
exports.DB = DB;
function extractConstructor(imported) {
    const keys = Object.keys(imported).filter((i) => [
        'RealTimeClient',
        'RealTimeAdmin',
        'FirestoreAdmin',
        'FirestoreClient',
    ].includes(i));
    return imported[keys[0]];
}
//# sourceMappingURL=db.js.map