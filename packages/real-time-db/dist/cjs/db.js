"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable: member-ordering
// tslint:disable:no-implicit-dependencies
const common_types_1 = require("common-types");
const convert = require("typed-conversions");
const serialized_query_1 = require("serialized-query");
const util_1 = require("./util");
const FileDepthExceeded_1 = require("./errors/FileDepthExceeded");
const UndefinedAssignment_1 = require("./errors/UndefinedAssignment");
const WatcherEventWrapper_1 = require("./WatcherEventWrapper");
const abstracted_database_1 = require("abstracted-database");
const errors_1 = require("./errors");
const AbstractedProxyError_1 = require("./errors/AbstractedProxyError");
const _1 = require(".");
const AbstractedError_1 = require("./errors/AbstractedError");
/** time by which the dynamically loaded mock library should be loaded */
exports.MOCK_LOADING_TIMEOUT = 2000;
class RealTimeDb extends abstracted_database_1.AbstractedDatabase {
    constructor(config = {}) {
        super();
        this._isAdminApi = false;
        /** how many miliseconds before the attempt to connect to DB is timed out */
        this.CONNECTION_TIMEOUT = 5000;
        this._isConnected = false;
        this._mockLoadingState = 'not-applicable';
        this._waitingForConnection = [];
        this._debugging = false;
        this._mocking = false;
        this._allowMocking = false;
        this._onConnected = [];
        this._onDisconnected = [];
        this._config = config;
        if (config.timeout) {
            this.CONNECTION_TIMEOUT = config.timeout;
        }
    }
    get isMockDb() {
        return this._mocking;
    }
    get isAdminApi() {
        return this._isAdminApi;
    }
    /**
     * **getPushKey**
     *
     * Get's a push-key from the server at a given path. This ensures that multiple
     * client's who are writing to the database will use the server's time rather than
     * their own local time.
     *
     * @param path the path in the database where the push-key will be pushed to
     */
    async getPushKey(path) {
        const key = await this.ref(path).push().key;
        return key;
    }
    // public get mock(): Mock {
    //   if (!this._mocking && !this._allowMocking) {
    //     const e = new Error(
    //       'You can not mock the database without setting mocking in the constructor'
    //     );
    //     e.name = 'AbstractedFirebase::NotAllowed';
    //     throw e;
    //   }
    //   if (this._mockLoadingState === 'loading') {
    //     const e = new Error(
    //       `Loading the mock library is an asynchronous task; typically it takes very little time but it is currently in process. You can listen to "waitForConnection()" to ensure the mock library is ready.`
    //     );
    //     e.name = 'AbstractedFirebase::AsyncError';
    //     throw e;
    //   }
    //   if (!this._mock) {
    //     const e = new Error(
    //       `Attempting to reference mock() on DB but _mock is not set [ mocking: ${this._mocking} ]!`
    //     );
    //     e.name = 'AbstractedFirebase::NotAllowed';
    //     throw e;
    //   }
    //   return this._mock;
    // }
    get isConnected() {
        return this._isConnected;
    }
    get config() {
        return this._config;
    }
    /**
     * called by `client` and `admin` at end of constructor
     */
    initialize(config = {}) {
        this._mocking = config.mocking ? true : false;
        this.connectToFirebase(config).then(() => this.listenForConnectionStatus());
    }
    // public abstract async auth(): Promise<A>;
    /**
     * watch
     *
     * Watch for firebase events based on a DB path or `SerializedQuery` (path plus query elements)
     *
     * @param target a database path or a SerializedQuery
     * @param events an event type or an array of event types (e.g., "value", "child_added")
     * @param cb the callback function to call when event triggered
     */
    watch(target, events, cb) {
        if (!Array.isArray(events)) {
            events = [events];
        }
        try {
            events.map(evt => {
                const dispatch = WatcherEventWrapper_1.WatcherEventWrapper({
                    eventType: evt,
                    targetType: 'path'
                })(cb);
                if (typeof target === 'string') {
                    this.ref(util_1.slashNotation(target)).on(evt, dispatch);
                }
                else {
                    target
                        .setDB(this)
                        .deserialize(this)
                        .on(evt, dispatch);
                }
            });
        }
        catch (e) {
            console.warn(`abstracted-firebase: failure trying to watch event ${JSON.stringify(events)}`);
            throw new AbstractedProxyError_1.AbstractedProxyError(e);
        }
    }
    unWatch(events, cb) {
        try {
            if (!Array.isArray(events)) {
                events = [events];
            }
            if (!events) {
                this.ref().off();
                return;
            }
            events.map(evt => {
                if (cb) {
                    this.ref().off(evt, cb);
                }
                else {
                    this.ref().off(evt);
                }
            });
        }
        catch (e) {
            e.name = e.code.includes('abstracted-firebase')
                ? 'AbstractedFirebase'
                : e.code;
            e.code = 'abstracted-firebase/unWatch';
            throw e;
        }
    }
    /**
     * Get a Firebase SerializedQuery reference
     *
     * @param path path for query
     */
    query(path) {
        return serialized_query_1.SerializedQuery.path(path);
    }
    /** Get a DB reference for a given path in Firebase */
    ref(path = '/') {
        return this._mocking ? this.mock.ref(path) : this._database.ref(path);
    }
    /**
     * Provides a promise-based way of waiting for the connection to be
     * established before resolving
     */
    async waitForConnection() {
        const config = this._config;
        if (_1.isMockConfig(config)) {
            // MOCKING
            await this.getFireMock({ db: config.mockData, auth: config.mockAuth });
        }
        else {
            // NON-MOCKING
            if (this._isConnected) {
                return;
            }
            const connectionEvent = () => {
                try {
                    return new Promise((resolve, reject) => {
                        this._eventManager.once('connection', (state) => {
                            if (state) {
                                resolve();
                            }
                            else {
                                reject(new AbstractedError_1.AbstractedError(`While waiting for a connection received a disconnect message instead`, `no-connection`));
                            }
                        });
                    });
                }
                catch (e) {
                    throw e;
                }
            };
            const timeout = async () => {
                await common_types_1.wait(this.CONNECTION_TIMEOUT);
                throw new AbstractedError_1.AbstractedError(`The database didn't connect after the allocated period of ${this.CONNECTION_TIMEOUT}ms`, 'connection-timeout');
            };
            await Promise.race([connectionEvent(), timeout()]);
            this._isConnected = true;
            return this;
        }
        this._onConnected.map(i => i.cb(this, i.ctx));
    }
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
    notifyWhenConnected(cb, id, 
    /**
     * additional context/pointers for your callback to use when activated
     */
    ctx) {
        if (!id) {
            id = Math.random()
                .toString(36)
                .substr(2, 10);
        }
        else {
            if (this._onConnected.map(i => i.id).includes(id)) {
                throw new AbstractedError_1.AbstractedError(`Request for onConnect() notifications was done with an explicit key [ ${id} ] which is already in use!`, `duplicate-listener`);
            }
        }
        this._onConnected = this._onConnected.concat({ id, cb, ctx });
        return id;
    }
    /**
     * removes a callback notification previously registered
     */
    removeNotificationOnConnection(id) {
        this._onConnected = this._onConnected.filter(i => i.id !== id);
        return this;
    }
    /** set a "value" in the database at a given path */
    async set(path, value) {
        // return new Promise((resolve, reject))
        try {
            const results = await this.ref(path).set(value);
        }
        catch (e) {
            if (e.code === 'PERMISSION_DENIED') {
                throw new errors_1.PermissionDenied(e, `The attempt to set a value at path "${path}" failed due to incorrect permissions.`);
            }
            if (e.message.indexOf('path specified exceeds the maximum depth that can be written') !== -1) {
                throw new FileDepthExceeded_1.FileDepthExceeded(e);
            }
            if (e.message.indexOf('First argument includes undefined in property') !==
                -1) {
                e.name = 'FirebaseUndefinedValueAssignment';
                throw new UndefinedAssignment_1.UndefinedAssignment(e);
            }
            throw new AbstractedProxyError_1.AbstractedProxyError(e, 'unknown', JSON.stringify({ path, value }));
        }
    }
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
    async multiPathSet(updates) {
        const fixed = Object.keys(updates).reduce((acc, path) => {
            const slashPath = path.replace(/\./g, '/').slice(0, 1) === '/'
                ? path.replace(/\./g, '/')
                : '/' + path.replace(/\./g, '/');
            acc[slashPath] = updates[path];
            return acc;
        }, {});
        await this.ref('/').update(fixed);
    }
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
    async update(path, value) {
        try {
            await this.ref(path).update(value);
        }
        catch (e) {
            if (e.code === 'PERMISSION_DENIED') {
                throw new errors_1.PermissionDenied(e, `The attempt to update a value at path "${path}" failed due to incorrect permissions.`);
            }
            else {
                throw new AbstractedProxyError_1.AbstractedProxyError(e, undefined, `While updating the path "${path}", an error occurred`);
            }
        }
    }
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
    async remove(path, ignoreMissing = false) {
        const ref = this.ref(path);
        try {
            const result = await ref.remove();
            return result;
        }
        catch (e) {
            if (e.code === 'PERMISSION_DENIED') {
                throw new errors_1.PermissionDenied(e, `The attempt to remove a value at path "${path}" failed due to incorrect permissions.`);
            }
            else {
                throw new AbstractedProxyError_1.AbstractedProxyError(e, undefined, `While removing the path "${path}", an error occurred`);
            }
        }
    }
    /**
     * **getSnapshot**
     *
     * returns the Firebase snapshot at a given path in the database
     */
    async getSnapshot(path) {
        try {
            const response = await (typeof path === 'string'
                ? this.ref(util_1.slashNotation(path)).once('value')
                : path.setDB(this).execute());
            return response;
        }
        catch (e) {
            console.warn(`There was a problem trying to get a snapshot from the database [ path parameter was of type "${typeof path}", fn: "getSnapshot()" ]:`, e.message);
            throw new AbstractedProxyError_1.AbstractedProxyError(e);
        }
    }
    /**
     * **getValue**
     *
     * Returns the JS value at a given path in the database. This method is a
     * typescript _generic_ which defaults to `any` but you can set the type to
     * whatever value you expect at that path in the database.
     */
    async getValue(path) {
        try {
            const snap = await this.getSnapshot(path);
            return snap.val();
        }
        catch (e) {
            throw new AbstractedProxyError_1.AbstractedProxyError(e);
        }
    }
    /**
     * **getRecord**
     *
     * Gets a snapshot from a given path in the Firebase DB
     * and converts it to a JS object where the snapshot's key
     * is included as part of the record (as `id` by default)
     */
    async getRecord(path, idProp = 'id') {
        try {
            const snap = await this.getSnapshot(path);
            let object = snap.val();
            if (typeof object !== 'object') {
                object = { value: snap.val() };
            }
            return Object.assign(Object.assign({}, object), { [idProp]: snap.key });
        }
        catch (e) {
            throw new AbstractedProxyError_1.AbstractedProxyError(e);
        }
    }
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
    async getList(path, idProp = 'id') {
        try {
            const snap = await this.getSnapshot(path);
            return snap.val() ? convert.snapshotToArray(snap, idProp) : [];
        }
        catch (e) {
            throw new AbstractedProxyError_1.AbstractedProxyError(e);
        }
    }
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
    async getSortedList(query, idProp = 'id') {
        try {
            return this.getSnapshot(query).then(snap => {
                return convert.snapshotToArray(snap, idProp);
            });
        }
        catch (e) {
            throw new AbstractedProxyError_1.AbstractedProxyError(e);
        }
    }
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
    async push(path, value) {
        try {
            this.ref(path).push(value);
        }
        catch (e) {
            if (e.code === 'PERMISSION_DENIED') {
                throw new errors_1.PermissionDenied(e, `The attempt to push a value to path "${path}" failed due to incorrect permissions.`);
            }
            else {
                throw new AbstractedProxyError_1.AbstractedProxyError(e, undefined, `While pushing to the path "${path}", an error occurred`);
            }
        }
    }
    /**
     * **exists**
     *
     * Validates the existance of a path in the database
     */
    async exists(path) {
        return this.getSnapshot(path).then(snap => (snap.val() ? true : false));
    }
    /**
     * monitorConnection
     *
     * allows interested parties to hook into event messages when the
     * DB connection either connects or disconnects
     */
    _monitorConnection(snap) {
        this._isConnected = snap.val();
        // call active listeners
        if (this._isConnected) {
            if (this._eventManager.connection) {
                this._eventManager.connection(this._isConnected);
            }
            this._onConnected.forEach(listener => listener.ctx
                ? listener.cb.bind(listener.ctx)(this)
                : listener.cb.bind(this)());
        }
        else {
            this._onDisconnected.forEach(listener => listener.cb(this));
        }
    }
    /**
     * When using the **Firebase** Authentication solution, the primary API
     * resides off the `db.auth()` call but each _provider_ also has an API
     * that can be useful and this has links to various providers.
     */
    get authProviders() {
        throw new Error(`The authProviders getter is intended to provide access to various auth providers but it is NOT implemented in the connection library you are using!`);
    }
    /**
     * **getFireMock**
     *
     * Asynchronously imports both `FireMock` and the `Faker` libraries
     * then sets `isConnected` to **true**
     */
    async getFireMock(config = {}) {
        try {
            this._mocking = true;
            this._mockLoadingState = 'loading';
            const FireMock = await Promise.resolve().then(() => require(
            /* webpackChunkName: "firemock" */ 'firemock'));
            this._mockLoadingState = 'loaded';
            try {
                this._mock = await FireMock.Mock.prepare(config);
            }
            catch (e) {
                console.info('There was an error trying to produce a mock object but because this requires the Faker library there are reasonable use cases where this may have been intentionally blocked\n\n', e.message);
            }
            this._isConnected = true;
        }
        catch (e) {
            throw new AbstractedProxyError_1.AbstractedProxyError(e, 'abstracted-firebase/firemock-load-failure', `Failed to load the FireMock library asynchronously. The config passed in was ${JSON.stringify(config, null, 2)}`);
        }
    }
}
exports.RealTimeDb = RealTimeDb;
