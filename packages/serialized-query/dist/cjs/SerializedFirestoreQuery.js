"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializedFirestoreQuery = void 0;
const index_1 = require("./index");
/**
 * Provides a way to serialize the full characteristics of a Firebase Firestore
 * Database query.
 */
class SerializedFirestoreQuery extends index_1.BaseSerializer {
    constructor() {
        super(...arguments);
        this._orderBy = "orderBy";
    }
    static path(path = "/") {
        return new SerializedFirestoreQuery(path);
    }
    get db() {
        if (this._db) {
            return this._db;
        }
        throw new Error("Attempt to use SerializedFirestoreQuery without setting database");
    }
    orderBy(child) {
        this._orderBy = "orderBy";
        this._orderKey = child;
        return this;
    }
    set db(value) {
        this._db = value;
    }
    deserialize(db) {
        const database = db || this.db;
        let q = database.ref(this.path);
        switch (this.identity.orderBy) {
            case "orderByKey":
                console.warn(`DEPRECATION: orderByKey sort is not supported in Firestore [${this.path}]`);
                break;
            case "orderByValue":
                console.warn(`DEPRECATION: orderByValue sort is not supported in Firestore [${this.path}]`);
                break;
            case "orderByChild":
            case "orderBy":
                q = q.orderBy(this.identity.orderByKey);
                break;
        }
        if (this.identity.limitToFirst) {
            q.limit(this.identity.limitToFirst);
        }
        if (this.identity.limitToLast) {
            q = q.limitToLast(this.identity.limitToLast);
        }
        if (this.identity.startAt) {
            q = q.where(this.path, ">", this.identity.startAt);
        }
        if (this.identity.endAt) {
            q = q.where(this.path, "<", this.identity.endAt);
        }
        if (this.identity.equalTo) {
            q = q.where(this.path, "==", this.identity.equalTo);
        }
        return q;
    }
    async execute(db) {
        const database = db || this.db;
        const snapshot = await this.deserialize(database).get();
        return snapshot;
    }
    where(operation, value, key) {
        switch (operation) {
            case "=":
                return this.equalTo(value, key);
            case ">":
                return this.startAt(value, key);
            case "<":
                return this.endAt(value, key);
            default:
                const err = new Error(`Unknown comparison operator: ${operation}`);
                err.code = "invalid-operator";
                throw err;
        }
    }
}
exports.SerializedFirestoreQuery = SerializedFirestoreQuery;
//# sourceMappingURL=SerializedFirestoreQuery.js.map