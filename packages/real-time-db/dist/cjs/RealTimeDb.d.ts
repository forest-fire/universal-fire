import { IDictionary } from 'common-types';
import { SerializedQuery } from 'serialized-query';
import { AbstractedDatabase } from '@forest-fire/abstracted-database';
import { IFirebaseListener, IFirebaseConnectionCallback, IMockLoadingState, IFirebaseWatchHandler, IClientEmitter, IAdminEmitter } from './index';
import { IMockConfigOptions, IRtdbDatabase, IRtdbEventType, IRtdbReference, IRtdbDataSnapshot, IDatabaseConfig, IFirebaseApp } from '@forest-fire/types';
/** time by which the dynamically loaded mock library should be loaded */
export declare const MOCK_LOADING_TIMEOUT = 2000;
export declare abstract class RealTimeDb extends AbstractedDatabase {
    protected _isAdminApi: boolean;
    constructor();
    get isMockDb(): boolean;
    get isAdminApi(): boolean;
    /**
     * **getPushKey**
     *
     * Get's a push-key from the server at a given path. This ensures that multiple
     * client's who are writing to the database will use the server's time rather than
     * their own local time.
     *
     * @param path the path in the database where the push-key will be pushed to
     */
    getPushKey(path: string): Promise<string>;
    get isConnected(): boolean;
    /** how many miliseconds before the attempt to connect to DB is timed out */
    CONNECTION_TIMEOUT: number;
    /** Logs debugging information to the console */
    enableDatabaseLogging: (logger?: boolean | ((a: string) => any), persistent?: boolean) => any;
    protected abstract _eventManager: IClientEmitter | IAdminEmitter;
    protected _isConnected: boolean;
    protected _mockLoadingState: IMockLoadingState;
    protected _resetMockDb: () => void;
    protected _waitingForConnection: Array<() => void>;
    protected _debugging: boolean;
    protected _mocking: boolean;
    protected _allowMocking: boolean;
    protected _app: IFirebaseApp;
    protected _database: IRtdbDatabase;
    protected _onConnected: IFirebaseListener[];
    protected _onDisconnected: IFirebaseListener[];
    /** the config the db was started with */
    protected _config: IDatabaseConfig;
    protected abstract _auth?: any;
    /**
     * watch
     *
     * Watch for firebase events based on a DB path or `SerializedQuery` (path plus query elements)
     *
     * @param target a database path or a SerializedQuery
     * @param events an event type or an array of event types (e.g., "value", "child_added")
     * @param cb the callback function to call when event triggered
     */
    watch(target: string | SerializedQuery<any>, events: IRtdbEventType | IRtdbEventType[], cb: IFirebaseWatchHandler): void;
    unWatch(events?: IRtdbEventType | IRtdbEventType[], cb?: any): void;
    /**
     * Get a Firebase SerializedQuery reference
     *
     * @param path path for query
     */
    query<T extends object = any>(path: string): SerializedQuery<T>;
    /** Get a DB reference for a given path in Firebase */
    ref(path?: string): IRtdbReference;
    /**
     * get a notification when DB is connected; returns a unique id
     * which can be used to remove the callback. You may, optionally,
     * state a unique id of your own.
     *
     * By default the callback will receive the database connection as it's
     * `this`/context. This means that any locally defined variables will be
     * dereferenced an unavailable. If you want to retain a connection to this
     * state you should include the optional _context_ parameter and your
     * callback will get a parameter passed back with this context available.
     */
    notifyWhenConnected(cb: IFirebaseConnectionCallback, id?: string, 
    /**
     * additional context/pointers for your callback to use when activated
     */
    ctx?: IDictionary): string;
    /**
     * removes a callback notification previously registered
     */
    removeNotificationOnConnection(id: string): this;
    /** set a "value" in the database at a given path */
    set<T = any>(path: string, value: T): Promise<void>;
    /**
     * **multiPathSet**
     *
     * Equivalent to Firebase's traditional "multi-path updates" which are
     * in behaviour are really "multi-path SETs". The basic idea is that
     * all the _keys_ are database paths and the _values_ are **destructive** values.
     *
     * An example of
     * what you might might look like:
     *
     * ```json
     * {
     *  "path/to/my/data": "my destructive data",
     *  "another/path/to/write/to": "everyone loves monkeys"
     * }
     * ```
     *
     * When we say "destructive" we mean that whatever value you put at the give path will
     * _overwrite_ the data that was there rather than "update" it. This not hard to
     * understand because we've given this function a name with "SET" in the name but
     * in the real-time database this actual translates into an alternative use of the
     * "update" command which is described here:
     * [Introducing Multi-Location Updates.](https://firebase.googleblog.com/2015/09/introducing-multi-location-updates-and_86.html)
     *
     * This functionality, in the end, is SUPER useful as it provides a means to achieve
     * transactional functionality (aka, either all paths are written to or none are).
     *
     * **Note:** because _dot notation_ for paths is not uncommon you can notate
     * the paths with `.` instead of `/`
     */
    multiPathSet(updates: IDictionary): Promise<void>;
    /**
     * **update**
     *
     * Update the database at a given path. Note that this operation is
     * **non-destructive**, so assuming that the value you are passing in
     * a POJO/object then the properties sent in will be updated but if
     * properties that exist in the DB, but not in the value passed in,
     * then these properties will _not_ be changed.
     *
     * [API Docs](https://firebase.google.com/docs/reference/js/firebase.database.Reference#update)
     */
    update<T = any>(path: string, value: Partial<T>): Promise<void>;
    /**
     * **remove**
     *
     * Removes a path from the database. By default if you attempt to
     * remove a path in the database which _didn't_ exist it will throw
     * a `abstracted-firebase/remove` error. If you'd prefer for this
     * error to be ignored than you can pass in **true** to the `ignoreMissing`
     * parameter.
     *
     * [API  Docs](https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove)
     */
    remove<T = any>(path: string, ignoreMissing?: boolean): Promise<any>;
    /**
     * **getSnapshot**
     *
     * returns the Firebase snapshot at a given path in the database
     */
    getSnapshot<T = any>(path: string | SerializedQuery<T>): Promise<IRtdbDataSnapshot>;
    /**
     * **getValue**
     *
     * Returns the JS value at a given path in the database. This method is a
     * typescript _generic_ which defaults to `any` but you can set the type to
     * whatever value you expect at that path in the database.
     */
    getValue<T = any>(path: string): Promise<T>;
    /**
     * **getRecord**
     *
     * Gets a snapshot from a given path in the Firebase DB
     * and converts it to a JS object where the snapshot's key
     * is included as part of the record (as `id` by default)
     */
    getRecord<T = any>(path: string | SerializedQuery<T>, idProp?: string): Promise<T>;
    /**
     * **getList**
     *
     * Get a list of a given type (defaults to _any_). Assumes that the
     * "key" for the record is the `id` property but that can be changed
     * with the optional `idProp` parameter.
     *
     * @param path the path in the database to
     * @param idProp
     */
    getList<T = any>(path: string | SerializedQuery<T>, idProp?: string): Promise<T[]>;
    /**
     * **getSortedList**
     *
     * getSortedList() will return the sorting order that was defined in the Firebase
     * Query. This _can_ be useful but often the sort orders
     * really intended for the server only (so that filteration
     * is done on the right set of data before sending to client).
     *
     * @param query Firebase "query ref"
     * @param idProp what property name should the Firebase key be converted to (default is "id")
     */
    getSortedList<T = any>(query: any, idProp?: string): Promise<T[]>;
    /**
     * **push**
     *
     * Pushes a value (typically a hash) under a given path in the
     * database but allowing Firebase to insert a unique "push key"
     * to ensure the value is placed into a Dictionary/Hash structure
     * of the form of `/{path}/{pushkey}/{value}`
     *
     * Note, the pushkey will be generated on the Firebase side and
     * Firebase keys are guarenteed to be unique and embedded into the
     * UUID is precise time-based information so you _can_ count on
     * the keys to have a natural time based sort order.
     */
    push<T = any>(path: string, value: T): Promise<void>;
    /**
     * **exists**
     *
     * Validates the existance of a path in the database
     */
    exists(path: string): Promise<boolean>;
    /**
     * monitorConnection
     *
     * allows interested parties to hook into event messages when the
     * DB connection either connects or disconnects
     */
    protected _monitorConnection(snap: IRtdbDataSnapshot): void;
    /**
     * Ensure that client and admin SDK's do whatever they need to
     * do to watch for changes in connection status.
     *
     * When a status change is detected it function should **emit**
     * a `connection` event.
     */
    protected abstract listenForConnectionStatus(): void;
    /**
     * When using the **Firebase** Authentication solution, the primary API
     * resides off the `db.auth()` call but each _provider_ also has an API
     * that can be useful and this has links to various providers.
     */
    get authProviders(): any;
    /**
     * **getFireMock**
     *
     * Asynchronously imports both `FireMock` and the `Faker` libraries
     * then sets `isConnected` to **true**
     */
    protected getFireMock(config?: IMockConfigOptions): Promise<void>;
}
