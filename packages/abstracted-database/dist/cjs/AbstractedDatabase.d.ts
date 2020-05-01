/// <reference types="firebase-admin" />
import { ISerializedQuery, IDatabaseConfig, MockDb, IRtdbDatabase, IFirestoreDatabase, IRtdbEventType, IFirestoreDbEvent, IClientAuth, IAdminAuth, IAdminApp, IClientApp } from '@forest-fire/types';
export { MockDb };
export declare abstract class AbstractedDatabase {
    /**
     * The configuration used to setup/configure the database.
     */
    get config(): IDatabaseConfig;
    /**
     * the configuration to connect to the database; based on
     * subclass this will be either a _client_ or _admin_ configuration
     * OR a _mock_ configuration.
     */
    protected abstract _config: IDatabaseConfig;
    /**
     * Indicates if the database is using the admin SDK.
     */
    protected _isAdminApi: boolean;
    /**
     * The mock API provided by **firemock**
     */
    protected _mock: MockDb | undefined;
    /**
     * The Firebase App API.
     */
    protected _app: IClientApp | IAdminApp | undefined;
    /**
     * The database API provided by Firebase (admin or client sdk of either
     * Firestore or RTDB)
     */
    protected _database: IRtdbDatabase | IFirestoreDatabase | undefined;
    /**
     * Returns the `_app`.
     */
    protected get app(): IClientApp | import("firebase-admin").app.App;
    /**
     * Sets the `_app`.
     */
    protected set app(value: IClientApp | import("firebase-admin").app.App);
    /**
     * Connects to the database and returns a promise which resolves when this
     * connection has been established.
     */
    abstract connect(): Promise<any>;
    /**
     * Returns the authentication API of the database.
     */
    abstract auth(): Promise<IClientAuth | IAdminAuth>;
    /**
     * Indicates if the database is using the admin SDK.
     */
    get isAdminApi(): boolean;
    /**
     * Indicates if the database is a mock database or not
     */
    get isMockDb(): boolean | undefined;
    /**
     * Returns the mock API provided by **firemock**
     * which in turn gives access to the actual database _state_ off of the
     * `db` property.
     *
     * This is only available if the database has been configured as a mocking database; if it is _not_
     * a mocked database a `AbstractedDatabase/not-allowed` error will be thrown.
     */
    get mock(): MockDb;
    /**
     * Get a list of a given type (defaults to _any_). Assumes that the "key" for
     * the record is the `id` property but that can be changed with the optional
     * `idProp` parameter.
     */
    abstract getList<T = any>(path: string | ISerializedQuery, idProp?: string): Promise<T[]>;
    /**
     * Get's a push-key from the server at a given path. This ensures that
     * multiple client's who are writing to the database will use the server's
     * time rather than their own local time.
     *
     * @param path the path in the database where the push-key will be pushed to
     */
    abstract getPushKey(path: string): Promise<string>;
    /**
     * Gets a record from a given path in the Firebase DB and converts it to an
     * object where the record's key is included as part of the record.
     */
    abstract getRecord<T = any>(path: string, idProp?: string): Promise<T>;
    /**
     * Returns the value at a given path in the database. This method is a
     * typescript _generic_ which defaults to `any` but you can set the type to
     * whatever value you expect at that path in the database.
     */
    abstract getValue<T = any>(path: string): Promise<T | void>;
    /**
     * Updates the database at a given path. Note that this operation is
     * **non-destructive**, so assuming that the value you are passing in a
     * POJO/object then the properties sent in will be updated but if properties
     * that exist in the DB, but not in the value passed in then these properties
     * will _not_ be changed.
     */
    abstract update<T = any>(path: string, value: Partial<T>): Promise<void>;
    /**
     * Sets a value in the database at a given path.
     */
    abstract set<T = any>(path: string, value: T): Promise<void>;
    /**
     * Removes a path from the database.
     */
    abstract remove(path: string): Promise<any>;
    /**
     * Watch for Firebase events based on a DB path.
     */
    abstract watch(target: string | ISerializedQuery, events: IFirestoreDbEvent | IFirestoreDbEvent[] | IRtdbEventType | IRtdbEventType[], cb: any): void;
    /**
     * Unwatches existing Firebase events.
     */
    abstract unWatch(events?: IFirestoreDbEvent | IFirestoreDbEvent[] | IRtdbEventType | IRtdbEventType[], cb?: any): void;
    /**
     * Returns a reference for a given path in Firebase
     */
    abstract ref(path?: string): any;
}
