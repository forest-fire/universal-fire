'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class FireError extends Error {
    constructor(message, 
    /**
     * a type/subtype of the error or you can just state the "subtype"
     * and it will
     */
    classification = 'UniversalFire/error', statusCode = 400) {
        super(message);
        this.universalFire = true;
        this.kind = 'FireError';
        const parts = classification.split('/');
        const klass = this.constructor.name;
        this.name = parts.length === 2 ? classification : `${klass}/${parts[0]}`;
        this.code = parts.length === 2 ? parts[1] : parts[0];
        this.kind = parts[0];
        this.statusCode = statusCode;
    }
}

function isMockConfig(config) {
    return config && config.mocking === true;
}
/**
 * In a client SDK setting, this checks that the typing is NOT a mock
 * typing (and that apiKey and databaseURL are indeed set) and responds
 * by letting typescript know that it is a `IClientConfig` configuration.
 */
function isClientConfig(config) {
    return config &&
        config.mocking !== true &&
        config.apiKey !== undefined &&
        config.databaseURL !== undefined
        ? true
        : false;
}

var RealQueryOrderType;
(function (RealQueryOrderType) {
    RealQueryOrderType["orderByChild"] = "orderByChild";
    RealQueryOrderType["orderByKey"] = "orderByKey";
    RealQueryOrderType["orderByValue"] = "orderByValue";
})(RealQueryOrderType || (RealQueryOrderType = {}));

/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
function getRunningApps(apps) {
    return apps.filter((i) => i !== null).map((i) => i.name);
}

/** Gets the  */
function getRunningFirebaseApp(name, apps) {
    const result = name
        ? apps.find((i) => i && i.name === name)
        : undefined;
    if (!result) {
        throw new FireError(`Attempt to get the Firebase app named "${name}" failed`, 'invalid-app-name');
    }
    return result;
}

function looksLikeJson(data) {
    return data.trim().slice(0, 1) === '{' && data.trim().slice(-1) === '}'
        ? true
        : false;
}

function extractEncodedString(data) {
    if (!data) {
        return undefined;
    }
    let failedJsonParse = false;
    if (looksLikeJson(data)) {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            // ignore and try BASE64
            failedJsonParse = true;
        }
    }
    try {
        const buffer = Buffer.from(data, 'base64');
        return JSON.parse(buffer.toString());
    }
    catch (e) {
        if (failedJsonParse) {
            throw new FireError(`Failed to parse the passed in encoded string; it appeared to be a JSON string but both JSON and Base64 decoding failed!`, `parse-failed`);
        }
        else {
            throw new FireError(`Failed to parse the passed in the Base64 encoded string`, `parse-failed`);
        }
    }
}

/**
 * Extracts the client configuration from ENV variables and processes it
 * through either BASE64 or JSON decoding.
 */
function extractClientConfig() {
    return extractEncodedString(process.env.FIREBASE_CONFIG);
}

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
     * Provides a set of API's that are exposed by the various "providers". Examples
     * include "emailPassword", "github", etc.
     *
     * > **Note:** this is only really available on the Client SDK's
     */
    get authProviders() {
        throw new FireError(`Only the client SDK's have a authProviders property`);
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
    /**
     * **getFireMock**
     *
     * Asynchronously imports both `FireMock` and the `Faker` libraries
     * then sets `isConnected` to **true**
     */
    async getFireMock(config = {}) {
        const FireMock = await Promise.resolve().then(function () { return require(
        /* webpackChunkName: "firemock" */ './index-9f3b3fbe.js'); });
        this._mock = await FireMock.Mock.prepare(config);
    }
}

class FirestoreDb extends AbstractedDatabase {
    get database() {
        if (this._database) {
            return this._database;
        }
        throw new FireError('Attempt to use Firestore without having instantiated it', 'not-ready');
    }
    set database(value) {
        this._database = value;
    }
    _isCollection(path) {
        path = typeof path !== 'string' ? path.path : path;
        return path.split('/').length % 2 === 0;
    }
    _isDocument(path) {
        return this._isCollection(path) === false;
    }
    get mock() {
        throw new Error('Not implemented');
    }
    async getList(path, idProp = 'id') {
        path = typeof path !== 'string' ? path.path : path;
        const querySnapshot = await this.database.collection(path).get();
        // @ts-ignore
        return querySnapshot.docs.map((doc) => {
            return {
                [idProp]: doc.id,
                ...doc.data(),
            };
        });
    }
    async getPushKey(path) {
        return this.database.collection(path).doc().id;
    }
    async getRecord(path, idProp = 'id') {
        const documentSnapshot = await this.database.doc(path).get();
        return {
            ...documentSnapshot.data(),
            [idProp]: documentSnapshot.id,
        };
    }
    async getValue(path) {
        throw new Error('Not implemented');
    }
    async update(path, value) {
        await this.database.doc(path).update(value);
    }
    async set(path, value) {
        await this.database.doc(path).set({ ...value });
    }
    async remove(path) {
        const pathIsCollection = this._isCollection(path);
        if (pathIsCollection) {
            this._removeCollection(path);
        }
        else {
            this._removeDocument(path);
        }
    }
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
        if (events && !isFirestoreEvent(events)) {
            throw new FirestoreDbError(`An attempt to watch an event which is not valid for the Firestore database (but likely is for the Real Time database). Events passed in were: ${JSON.stringify(events)}\n. In contrast, the valid events in Firestore are: ${VALID_FIRESTORE_EVENTS.join(', ')}`, 'invalid-event');
        }
        throw new Error('Not implemented');
    }
    unWatch(events, cb) {
        if (events && !isFirestoreEvent(events)) {
            throw new FirestoreDbError(`An attempt was made to unwatch an event type which is not valid for the Firestore database. Events passed in were: ${JSON.stringify(events)}\nIn contrast, the valid events in Firestore are: ${VALID_FIRESTORE_EVENTS.join(', ')}`, 'invalid-event');
        }
        throw new Error('Not implemented');
    }
    ref(path = '/') {
        throw new Error('Not implemented');
    }
    async _removeDocument(path) {
        await this.database.doc(path).delete();
    }
    async _removeCollection(path) {
        const batch = this.database.batch();
        // @ts-ignore
        this.database.collection(path).onSnapshot((snapshot) => {
            // @ts-ignore
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
        });
        // All or nothing.
        await batch.commit();
    }
}

const VALID_FIRESTORE_EVENTS = ['added', 'removed', 'modified'];
/**
 * Validates that all events passed in are valid events for
 * the **Firestore** database.
 *
 * @param events the event or events which are being tested
 */
function isFirestoreEvent(events) {
    const evts = Array.isArray(events) ? events : [events];
    return evts.every((e) => (VALID_FIRESTORE_EVENTS.includes(e) ? true : false));
}

class FirestoreDbError extends FireError {
}

class FirestoreClient extends FirestoreDb {
    constructor(config) {
        super();
        this.sdk = "FirestoreClient" /* FirestoreClient */;
        this._isAdminApi = false;
        if (!config) {
            config = extractClientConfig();
            if (!config) {
                throw new FireError(`The client configuration was not set. Either set in the code or use the environment variables!`, `invalid-configuration`);
            }
        }
        this._config = config;
    }
    static async connect(config) {
        const obj = new FirestoreClient(config);
        await obj.connect();
        return obj;
    }
    async connect() {
        if (isMockConfig(this._config)) {
            await this._connectMockDb(this._config);
        }
        else if (isClientConfig(this._config)) {
            await this._connectRealDb(this._config);
        }
        else {
            throw new Error(`The configuration is of an unknown type: ${JSON.stringify(this._config)}`);
        }
        return this;
    }
    async auth() {
        if (this._auth) {
            return this._auth;
        }
        if (!this.isConnected) {
            this._config.useAuth = true;
            await this.connect();
        }
        if (!this._app.auth) {
            await this.loadAuthApi();
        }
        this._auth = this._app.auth();
        return this._auth;
    }
    async loadFirebaseAppApi() {
        return (await Promise.resolve().then(function () { return require('./index.esm-e6d606d0.js'); }).then(function (n) { return n.index_esm; }));
    }
    async loadAuthApi() {
        return Promise.resolve().then(function () { return require('./auth.esm-31bc3a61.js'); });
    }
    /**
     * This loads the firestore API but more importantly this makes the
     * firestore function available off the Firebase App API which provides
     * us instances of the of the firestore API.
     */
    async loadFirestoreApi() {
        // TODO: the typing return here is being ignored because we're using this
        // only as a pre-step to use the App API but in fact this probably does
        // return the static Firestore API which may very well be useful.
        return Promise.resolve().then(function () { return require('./index.esm-0adc47d9.js'); });
    }
    /**
     * The steps needed to connect a database to a Firemock
     * mocked DB.
     */
    async _connectMockDb(config) {
        await this.getFireMock({
            db: config.mockData || {},
            auth: { providers: [], ...config.mockAuth },
        });
        this._authProviders = this._mock.authProviders;
    }
    async _connectRealDb(config) {
        if (!this._isConnected) {
            await this.loadFirestoreApi();
            let firebase;
            if (config.useAuth) {
                this._auth = await this.loadAuthApi();
                firebase = (await this.loadFirebaseAppApi());
            }
            else {
                firebase = (await this.loadFirebaseAppApi());
            }
            const runningApps = getRunningApps(firebase.apps);
            this._app = runningApps.includes(config.name)
                ? getRunningFirebaseApp(config.name, firebase.apps)
                : firebase.initializeApp(config, config.name);
            this._database = firebase.firestore(this._app);
        }
        else {
            console.info(`Database ${config.name} already connected`);
        }
    }
}

exports.FirestoreClient = FirestoreClient;
//# sourceMappingURL=index.js.map
