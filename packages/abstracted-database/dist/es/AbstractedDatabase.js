export class AbstractedDatabase {
    constructor() {
        /**
         * Indicates if the database is using the admin SDK.
         */
        this._isAdminApi = false;
        /**
         * Indicates if the database is a mock database.
         */
        this._isMock = false;
    }
    static async connect(constructor, config) {
        const db = new constructor(config);
        return db.connect();
    }
    /**
     * Returns the `_app`.
     */
    get app() {
        if (this._app) {
            return this._app;
        }
        throw new Error('Attempt to access Firebase App without having instantiated it');
    }
    /**
     * Sets the `_app`.
     */
    set app(value) {
        this._app = value;
    }
    /**
     * Indicates if the database is using the admin SDK.
     */
    get isAdminApi() {
        return this._isAdminApi;
    }
    /**
     * Indicates if the database is a mock database.
     */
    get isMockDb() {
        return this._isMock;
    }
}
//# sourceMappingURL=AbstractedDatabase.js.map