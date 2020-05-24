import { SerializedFirestoreQuery, SerializedRealTimeQuery, } from '@forest-fire/serialized-query';
export class SerializedQuery {
    static create(db, path = '/') {
        const name = db.constructor.name;
        if (['RealTimeClient', 'RealTimeAdmin', 'RealTimeDb'].includes(name)) {
            return SerializedRealTimeQuery.path(path);
        }
        else {
            return SerializedFirestoreQuery.path(path);
        }
    }
}
//# sourceMappingURL=SerializedQuery.js.map