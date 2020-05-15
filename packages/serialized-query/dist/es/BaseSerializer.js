export class BaseSerializer {
    constructor(path = "/") {
        this._path = slashNotation(path);
    }
    static async create(constructor, path = "/") {
        return new constructor(path);
    }
    get db() {
        if (this._db) {
            return this._db;
        }
        throw new Error("Attempt to use SerializedQuery without setting database");
    }
    get path() {
        return this._path;
    }
    get identity() {
        return {
            endAtKey: this._endAtKey,
            endAt: this._endAt,
            equalToKey: this._equalToKey,
            equalTo: this._equalTo,
            limitToFirst: this._limitToFirst,
            limitToLast: this._limitToLast,
            orderByKey: this._orderKey,
            orderBy: this._orderBy,
            path: this._path,
            startAtKey: this._startAtKey,
            startAt: this._startAt,
        };
    }
    /**
     * Allows the DB interface to be setup early, allowing clients
     * to call execute without any params.
     */
    setDB(db) {
        this._db = db;
        return this;
    }
    setPath(path) {
        this._path = slashNotation(path);
        return this;
    }
    /**
     * Returns a unique numeric hashcode for this query
     */
    hashCode() {
        const identity = JSON.stringify(this.identity);
        let hash = 0;
        if (identity.length === 0) {
            return hash;
        }
        for (let i = 0; i < identity.length; i++) {
            const char = identity.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            // Convert to 32bit integer.
            hash = hash & hash;
        }
        return hash;
    }
    limitToFirst(value) {
        this._limitToFirst = value;
        return this;
    }
    limitToLast(value) {
        this._limitToLast = value;
        return this;
    }
    orderByChild(child) {
        this._orderBy = "orderByChild";
        this._orderKey = child;
        return this;
    }
    orderByValue() {
        this._orderBy = "orderByValue";
        return this;
    }
    orderByKey() {
        this._orderBy = "orderByKey";
        return this;
    }
    startAt(value, key) {
        this._startAt = value;
        this._startAtKey = key;
        return this;
    }
    endAt(value, key) {
        this._endAt = value;
        this._endAtKey = key;
        return this;
    }
    equalTo(value, key) {
        this._equalTo = value;
        this._equalToKey = key;
        return this;
    }
    toJSON() {
        return this.identity;
    }
    toString() {
        return JSON.stringify(this.identity, null, 2);
    }
}
function slashNotation(path) {
    return path.replace(/\./g, "/");
}
//# sourceMappingURL=BaseSerializer.js.map