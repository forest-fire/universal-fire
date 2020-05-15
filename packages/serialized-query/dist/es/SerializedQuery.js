import { SerializedFirestoreQuery, SerializedRealTimeQuery } from "./index";
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
//# sourceMappingURL=SerializedQuery.js.map