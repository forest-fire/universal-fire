"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("@forest-fire/utility");
class AbstractedDatabase {
    constructor() {
        /**
         * Indicates if the database is using the admin SDK.
         */
        this._isAdminApi = false;
        /**
         * Indicates if the database is connected.
         */
        this._isConnected = false;
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
     * Indicates if the database is a mock database or not
     */
    get isMockDb() {
        return this._config.mocking;
    }
    /**
     * The configuration used to setup/configure the database.
     */
    get config() {
        return this._config;
    }
    /**
     * Returns the mock API provided by **firemock**
     * which in turn gives access to the actual database _state_ off of the
     * `db` property.
     *
     * This is only available if the database has been configured as a mocking database; if it is _not_
     * a mocked database a `AbstractedDatabase/not-allowed` error will be thrown.
     */
    get mock() {
        if (!this.isMockDb) {
            throw new utility_1.FireError(`Attempt to access the "mock" property on an abstracted is not allowed unless the database is configured as a Mock database!`, 'AbstractedDatabase/not-allowed');
        }
        if (!this._mock) {
            throw new utility_1.FireError(`Attempt to access the "mock" property on a configuration which IS a mock database but the Mock API has not been initialized yet!`);
        }
        return this._mock;
    }
    /**
     * Returns true if the database is connected, false otherwis.
     */
    get isConnected() {
        return this._isConnected;
    }
}
exports.AbstractedDatabase = AbstractedDatabase;
//# sourceMappingURL=AbstractedDatabase.js.map