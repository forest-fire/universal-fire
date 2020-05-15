import { SerializedFirestoreQuery, SerializedRealTimeQuery } from "@forest-fire/serialized-query";
export class SerializedQuery {
    static create(db, path = "/") {
        const name = db.constructor.name;
        if (["RealTimeClient", "RealTimeAdmin"].includes(name)) {
            return SerializedRealTimeQuery.path(path);
        }
        else {
            return SerializedFirestoreQuery.path(path);
        }
    }
}
//# sourceMappingURL=BaseSerializer.js.map