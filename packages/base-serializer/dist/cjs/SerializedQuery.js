"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializedQuery = void 0;
const serialized_query_1 = require("@forest-fire/serialized-query");
class SerializedQuery {
    static create(db, path = '/') {
        if (['RealTimeClient', 'RealTimeAdmin', 'RealTimeDb'].includes(db.sdk)) {
            return serialized_query_1.SerializedRealTimeQuery.path(path);
        }
        else {
            return serialized_query_1.SerializedFirestoreQuery.path(path);
        }
    }
}
exports.SerializedQuery = SerializedQuery;
//# sourceMappingURL=SerializedQuery.js.map