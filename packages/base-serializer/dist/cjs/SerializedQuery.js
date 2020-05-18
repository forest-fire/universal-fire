"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serialized_query_1 = require("@forest-fire/serialized-query");
class SerializedQuery {
    static create(db, path = '/') {
        const name = db.constructor.name;
        if (['RealTimeClient', 'RealTimeAdmin'].includes(name)) {
            return serialized_query_1.SerializedRealTimeQuery.path(path);
        }
        else {
            return serialized_query_1.SerializedFirestoreQuery.path(path);
        }
    }
}
exports.SerializedQuery = SerializedQuery;
//# sourceMappingURL=SerializedQuery.js.map