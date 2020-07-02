import firebase from 'firebase-admin';

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
function isAdminConfig(config) {
    return config &&
        config.mocking !== true &&
        config.apiKey === undefined &&
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
 * Takes as input a variety of possible formats and converts it into
 * a Firebase service account (`IServiceAccount`). The input formats
 * which it accepts are:
 *
 * - an `IServiceAccount` object (_in which case nothing to be done_)
 * - a JSON encoded string of the `IServiceAccount` object
 * - a base64 encoded string of a `IServiceAccount` object (_possible but not recommended
 * as an ENV variable may run out of room to encode_)
 * - a base64 encoded GZIP of a `IServiceAccount` object (_this is ideal for ENV vars
 * which have limited length and must be string_)
 */
function extractServiceAccount(config) {
    if (isMockConfig(config)) {
        return {};
    }
    const serviceAccount = config && config.mocking !== true && config.serviceAccount
        ? config.serviceAccount
        : process.env['FIREBASE_SERVICE_ACCOUNT'];
    if (!serviceAccount) {
        throw new FireError(`There was no service account defined (either passed in or in the FIREBASE_SERVICE_ACCOUNT ENV variable)!`, 'invalid-configuration');
    }
    switch (typeof serviceAccount) {
        case 'object':
            if (serviceAccount.privateKey && serviceAccount.projectId) {
                return serviceAccount;
            }
            else {
                throw new FireError(`An attempt to use the Admin SDK failed because a service account object was passed in but it did NOT have the required properties of "privateKey" and "projectId".`, 'invalid-configuration');
            }
        case 'string':
            // JSON
            if (looksLikeJson(serviceAccount)) {
                try {
                    const data = JSON.parse(serviceAccount);
                    if (data.private_key && data.type === 'service_account') {
                        return data;
                    }
                    else {
                        throw new FireError(`The configuration appeared to contain a JSON encoded representation of the service account but after decoding it the private_key and/or the type property were not correctly set.`, 'invalid-configuration');
                    }
                }
                catch (e) {
                    throw new FireError(`The configuration appeared to contain a JSOn encoded representation but was unable to be parsed: ${e.message}`, 'invalid-configuration');
                }
            }
            // BASE 64
            try {
                const buffer = Buffer.from(serviceAccount, 'base64');
                return JSON.parse(buffer.toString());
            }
            catch (e) {
                throw new FireError(`Failed to convert a string based service account to IServiceAccount! The error was: ${e.message}`, 'invalid-configuration');
            }
        default:
            throw new FireError(`Couldn't extract the serviceAccount from ENV variables! The configuration was:\n${(2)}`, 'invalid-configuration');
    }
}

/**
 * extracts the Firebase **databaseURL** property either from the passed in
 * configuration or via the FIREBASE_DATABASE_URL environment variable.
 */
function extractDataUrl(config) {
    if (isMockConfig(config)) {
        return 'https://mocking.com';
    }
    const dataUrl = config && config.databaseURL
        ? config.databaseURL
        : process.env['FIREBASE_DATABASE_URL'];
    if (!dataUrl) {
        throw new FireError(`There was no DATABASE URL provided! This needs to be passed in as part of the configuration or as the FIREBASE_DATABASE_URL environment variable.`, 'invalid-configuration');
    }
    return dataUrl;
}

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

function determineDefaultAppName(config) {
    if (!config) {
        return '[DEFAULT]';
    }
    return config.name
        ? config.name
        : config.databaseURL
            ? config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1')
            : '[DEFAULT]';
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
        const FireMock = await import(
        /* webpackChunkName: "firemock" */ 'firemock');
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

class FirestoreAdmin extends FirestoreDb {
    constructor(config) {
        super();
        this.sdk = "FirestoreAdmin" /* FirestoreAdmin */;
        this._isAdminApi = true;
        if (isMockConfig(config)) {
            throw new FireError(`Mock is not supported by Firestore`, `invalid-configuration`);
        }
        if (!config) {
            config = {
                serviceAccount: extractServiceAccount(config),
                databaseURL: extractDataUrl(config),
            };
        }
        if (isAdminConfig(config)) {
            config.serviceAccount =
                config.serviceAccount || extractServiceAccount(config);
            config.databaseURL = config.databaseURL || extractDataUrl(config);
            config.name = determineDefaultAppName(config);
            this._config = config;
        }
        else {
            throw new FireError(`The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(config, null, 2)}`, 'invalid-configuration');
        }
        this._config = config;
    }
    static async connect(config) {
        const obj = new FirestoreAdmin(config);
        await obj.connect();
        return obj;
    }
    /**
     * Connects the database by async loading the npm dependencies
     * for the Admin API. This is all that is needed to be considered
     * "connected" in an Admin SDK.
     */
    async connect() {
        if (this._isConnected) {
            console.info(`Firestore already connected to app name "${this.config.name}"`);
            return this;
        }
        if (isAdminConfig(this._config)) {
            await this._connectRealDb(this._config);
        }
        else if (isMockConfig(this._config)) {
            await this._connectMockDb(this._config);
        }
        else {
            console.warn(`Call to connect() being ignored as the configuration was not recognized as a valid admin or mock config. The config was: ${JSON.stringify(this._config, null, 2)}`);
        }
    }
    async auth() {
        if (this._config.mocking) {
            throw new FireError(`The auth API for MOCK databases is not yet implemented for Firestore`);
        }
        return firebase.auth(this._app);
    }
    async _connectRealDb(config) {
        if (!config.serviceAccount) {
            throw new FireError(`There was no service account found in the configuration!`);
        }
        const runningApps = getRunningApps(firebase.apps);
        const credential = firebase.credential.cert(config.serviceAccount);
        if (!this._isConnected) {
            this._app = runningApps.includes(config.name)
                ? getRunningFirebaseApp(config.name, firebase.apps)
                : firebase.initializeApp({
                    credential,
                    databaseURL: config.databaseURL,
                }, config.name);
            // this._firestore = firebase.firestore(this._app);
        }
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
    }
}

export { FirestoreAdmin };
//# sourceMappingURL=index.js.map
