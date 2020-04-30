"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./@types/index");
const index_2 = require("./index");
/**
 * Provides a way to serialize the full characteristics of a Firebase Realtime
 * Database query.
 */
class SerializedRealTimeQuery extends index_2.SerializedQuery {
    constructor() {
        super(...arguments);
        this._orderBy = 'orderByKey';
    }
    static path(path = '/') {
        return new SerializedRealTimeQuery(path);
    }
    startAt(value, key) {
        this.validateKey('startAt', key, [
            index_1.RealQueryOrderType.orderByChild,
            index_1.RealQueryOrderType.orderByValue
        ]);
        super.startAt(value, key);
        return this;
    }
    endAt(value, key) {
        this.validateKey('endAt', key, [
            index_1.RealQueryOrderType.orderByChild,
            index_1.RealQueryOrderType.orderByValue
        ]);
        super.endAt(value, key);
        return this;
    }
    equalTo(value, key) {
        super.equalTo(value, key);
        this.validateKey('equalTo', key, [
            index_1.RealQueryOrderType.orderByChild,
            index_1.RealQueryOrderType.orderByValue
        ]);
        return this;
    }
    deserialize(db) {
        const database = db || this.db;
        let q = database.ref(this.path);
        switch (this._orderBy) {
            case 'orderByKey':
                q = q.orderByKey();
                break;
            case 'orderByValue':
                q = q.orderByValue();
                break;
            case 'orderByChild':
                q = q.orderByChild(this.identity.orderByKey);
                break;
        }
        if (this.identity.limitToFirst) {
            q = q.limitToFirst(this.identity.limitToFirst);
        }
        if (this.identity.limitToLast) {
            q = q.limitToLast(this.identity.limitToLast);
        }
        if (this.identity.startAt) {
            q = q.startAt(this.identity.startAt, this.identity.startAtKey);
        }
        if (this.identity.endAt) {
            q = q.endAt(this.identity.endAt, this.identity.endAtKey);
        }
        if (this.identity.equalTo) {
            q = this.identity.equalToKey
                ? q.equalTo(this.identity.equalTo, this.identity.equalToKey)
                : q.equalTo(this.identity.equalTo);
        }
        return q;
    }
    async execute(db) {
        const database = db || this.db;
        const snapshot = await this.deserialize(database).once('value');
        return snapshot;
    }
    where(operation, value, key) {
        switch (operation) {
            case '=':
                return this.equalTo(value, key);
            case '>':
                return this.startAt(value, key);
            case '<':
                return this.endAt(value, key);
            default:
                const err = new Error(`Unknown comparison operator: ${operation}`);
                err.code = 'invalid-operator';
                throw err;
        }
    }
    /**
     * Ensures that when a `key` is passed in as part of the query modifiers --
     * such as "startAt", "endAt", etc. -- that the sorting strategy is valid.
     *
     * @param caller gives a simple string name for the method
     * which is currently being called to modify the search filters
     * @param key the key value that _might_ have been erroneously passed in
     */
    validateKey(caller, key, allowed) {
        const isNotAllowed = allowed.includes(this._orderBy) === false;
        if (key && isNotAllowed) {
            throw new Error(`You can not use the "key" parameter with ${caller}() when using a "${this._orderBy}" sort. Valid ordering strategies are: ${allowed.join(', ')}`);
        }
    }
}
exports.SerializedRealTimeQuery = SerializedRealTimeQuery;
//# sourceMappingURL=SerializedRealTimeQuery.js.map