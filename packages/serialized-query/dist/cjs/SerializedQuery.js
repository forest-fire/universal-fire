"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializedQuery = void 0;
const index_1 = require("./index");
class SerializedQuery {
    static create(db, path = "/") {
        const name = db.constructor.name;
        if (["RealTimeClient", "RealTimeAdmin"].includes(name)) {
            return index_1.SerializedRealTimeQuery.path(path);
        }
        else {
            return index_1.SerializedFirestoreQuery.path(path);
        }
    }
}
exports.SerializedQuery = SerializedQuery;
//# sourceMappingURL=SerializedQuery.js.map