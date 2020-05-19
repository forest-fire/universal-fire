import { FireError } from '@forest-fire/utility';
export class AbstractedDatabase {
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
     * Returns key characteristics about the Firebase app being managed.
     */
    get app() {
        if (this.config.mocking) {
            throw new FireError(`The "app" object is provided as direct access to the Firebase API when using a real database but not when using a Mock DB!`, 'not-allowed');
        }
        if (this._app) {
            return {
                name: this._app.name,
                databaseURL: this._app.options.databaseURL
                    ? this._app.options.databaseURL
                    : '',
                projectId: this._app.options.projectId
                    ? this._app.options.projectId
                    : '',
                storageBucket: this._app.options.storageBucket
                    ? this._app.options.storageBucket
                    : '',
            };
        }
        throw new FireError('Attempt to access Firebase App without having instantiated it');
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
            throw new FireError(`Attempt to access the "mock" property on an abstracted is not allowed unless the database is configured as a Mock database!`, 'AbstractedDatabase/not-allowed');
        }
        if (!this._mock) {
            throw new FireError(`Attempt to access the "mock" property on a configuration which IS a mock database but the Mock API has not been initialized yet!`);
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
//# sourceMappingURL=AbstractedDatabase.js.map