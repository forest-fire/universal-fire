import { SerializedFirestoreQuery, SerializedRealTimeQuery, } from '@forest-fire/serialized-query';
export class SerializedQuery {
    static create(db, path = '/') {
        if (['RealTimeClient', 'RealTimeAdmin', 'RealTimeDb'].includes(db.sdk)) {
            return SerializedRealTimeQuery.path(path);
        }
        else {
            return SerializedFirestoreQuery.path(path);
        }
    }
}
//# sourceMappingURL=SerializedQuery.js.map