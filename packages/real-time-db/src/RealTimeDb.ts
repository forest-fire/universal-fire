import { snapshotToArray } from 'typed-conversions';

import {
  AbstractedProxyError,
  FileDepthExceeded,
  IAdminEmitter,
  IClientEmitter,
  IFirebaseConnectionCallback,
  IFirebaseListener,
  IFirebaseWatchHandler,
  IMockLoadingState,
  PermissionDenied,
  RealTimeDbError,
  UndefinedAssignment,
  WatcherEventWrapper,
  isRealTimeEvent,
  VALID_REAL_TIME_EVENTS,
} from './index';
import {
  IAdminApp,
  IClientApp,
  IDatabaseConfig,
  IRtdbDataSnapshot,
  IRtdbDatabase,
  IRtdbDbEvent,
  ISerializedQuery,
  IAbstractedEvent,
  IModel,
  IMockDatabase,
  IRtdbSdk,
  IDatabaseSdk,
  DbFrom,
  IRtdbReference,
  SDK,
  IClientAuth,
  IAdminAuth,
  DbTypeFrom,
} from '@forest-fire/types';

import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { createError, IDictionary } from 'common-types';
import { FireError, slashNotation } from '@forest-fire/utility';

/** time by which the dynamically loaded mock library should be loaded */
export const MOCK_LOADING_TIMEOUT = 2000;

export abstract class RealTimeDb<TSdk extends IRtdbSdk>
  implements IDatabaseSdk<TSdk>
{
  dbType: DbTypeFrom<TSdk>;
  sdk: TSdk;
  isAdminApi: TSdk extends SDK.RealTimeAdmin ? true : false;
  abstract connect(): Promise<void>;
  abstract auth(): Promise<IClientAuth | IAdminAuth>;
  public get app(): any {
    if (!this._app) {
      throw createError(
        'not-ready',
        `Failed to return the Firebase "app" as this has not yet been asynchronously loaded yet`
      );
    }
    return this._app;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * **getPushKey**
   *
   * Gets a push-key from the server at a given path. This ensures that multiple
   * client's who are writing to the database will use the server's time rather than
   * their own local time.
   *
   * @param path the path in the database where the push-key will be pushed to
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async getPushKey(path: string): Promise<string> {
    const node = this.ref(path).push();
    return node.key;
  }

  /** how many milliseconds before the attempt to connect to DB is timed out */
  public CONNECTION_TIMEOUT = 5000;
  /** Logs debugging information to the console */
  public enableDatabaseLogging: (
    logger?: boolean | ((a: string) => unknown),
    persistent?: boolean
  ) => unknown;

  protected abstract _eventManager: IClientEmitter | IAdminEmitter;
  protected _isConnected = false;
  protected _mockLoadingState: IMockLoadingState = 'not-applicable';

  protected _resetMockDb: () => void;
  protected _waitingForConnection: Array<() => void> = [];
  protected _debugging = false;
  protected _mocking = false;
  protected _allowMocking = false;
  protected _app: IClientApp | IAdminApp;
  protected _mock?: IMockDatabase<TSdk>;
  protected _database?: IRtdbDatabase;
  protected _onConnected: IFirebaseListener<TSdk>[] = [];
  protected _onDisconnected: IFirebaseListener<TSdk>[] = [];
  protected _config: IDatabaseConfig;

  protected get database(): IRtdbDatabase {
    if (!this._database) {
      throw new RealTimeDbError(
        `Attempt to use the RealTimeDB.database getter prior to the database being set!`,
        `not-ready`
      );
    }
    return this._database;
  }

  protected set database(value: IRtdbDatabase) {
    this._database = value;
  }

  public get isMockDb(): boolean {
    return this._config.mocking;
  }
  public get config(): IDatabaseConfig {
    return this._config;
  }

  public get mock(): IMockDatabase<IRtdbSdk> {
    if (!this.isMockDb) {
      throw new FireError(
        `Attempt to access the "mock" property on an abstracted is not allowed unless the database is configured as a Mock database!`,
        'AbstractedDatabase/not-allowed'
      );
    }
    if (!this._mock) {
      throw new FireError(
        `Attempt to access the "mock" property on a configuration which IS a mock database but the Mock API has not been initialized yet!`
      );
    }
    return this._mock;
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
  public watch<T extends IModel>(
    target: string | ISerializedQuery<TSdk>,
    events: IAbstractedEvent | IAbstractedEvent[],
    cb: IFirebaseWatchHandler
  ): void {
    if (!Array.isArray(events)) {
      events = [events];
    }

    if (events && !isRealTimeEvent(events)) {
      throw new RealTimeDbError(
        `An attempt to watch an event which is not valid for the Real Time database (but likely is for the Firestore database). Events passed in were: ${JSON.stringify(
          events
        )}\n. In contrast, the valid events in Firestore are: ${VALID_REAL_TIME_EVENTS.join(
          ', '
        )}`,
        'invalid-event'
      );
    }

    try {
      events.map((evt: IRtdbDbEvent) => {
        const dispatch = WatcherEventWrapper({
          eventType: evt,
          targetType: 'path',
        })(cb);

        if (typeof target === 'string') {
          this.ref(slashNotation(target)).on(evt, dispatch);
        } else {
          target
            .setDB(this as unknown as DbFrom<TSdk>)
            .deserialize(this as unknown as DbFrom<TSdk>)
            .on(evt, dispatch);
        }
      });
    } catch (e) {
      console.warn(
        `RealTimeDb: failure trying to watch event ${JSON.stringify(events)}`
      );
      throw new AbstractedProxyError(e);
    }
  }

  public unWatch(
    events?: IAbstractedEvent | IAbstractedEvent[],
    cb?: any
  ): void {
    if (events && !isRealTimeEvent(events)) {
      throw new RealTimeDbError(
        `An attempt was made to unwatch an event type which is not valid for the Real Time database. Events passed in were: ${JSON.stringify(
          events
        )}\nIn contrast, the valid events in Firestore are: ${VALID_REAL_TIME_EVENTS.join(
          ', '
        )}`,
        'invalid-event'
      );
    }

    try {
      if (!events) {
        this.ref().off();
        return;
      }

      if (!Array.isArray(events)) {
        events = [events];
      }
      events.map((evt: IRtdbDbEvent) => {
        if (cb) {
          this.ref().off(evt, cb);
        } else {
          this.ref().off(evt);
        }
      });
    } catch (e) {
      e.name = e.code.includes('RealTimeDb') ? 'AbstractedFirebase' : e.code;
      e.code = 'RealTimeDb/unWatch';
      throw e;
    }
  }

  /**
   * Get a Firebase SerializedQuery reference
   *
   * @param path path for query
   */
  public query<T extends IModel = Record<string, unknown> & IModel>(
    path: string
  ): ISerializedQuery<IRtdbSdk, T> {
    return new SerializedRealTimeQuery<IRtdbSdk, T>(path);
  }

  /** Get a DB reference for a given path in Firebase */
  public ref(path = '/'): IRtdbReference {
    return this.isMockDb
      ? (this.mock.db.ref(path) as IRtdbReference)
      : (this._database.ref(path) as IRtdbReference);
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
  public notifyWhenConnected(
    cb: IFirebaseConnectionCallback<TSdk>,
    id?: string,
    /**
     * additional context/pointers for your callback to use when activated
     */
    ctx?: IDictionary
  ): string {
    if (!id) {
      id = Math.random().toString(36).substr(2, 10);
    } else {
      if (this._onConnected.map((i) => i.id).includes(id)) {
        throw new RealTimeDbError(
          `Request for onConnect() notifications was done with an explicit key [ ${id} ] which is already in use!`,
          `duplicate-listener`
        );
      }
    }

    this._onConnected = this._onConnected.concat({ id, cb, ctx });
    return id;
  }

  /**
   * removes a callback notification previously registered
   */
  public removeNotificationOnConnection(id: string) {
    this._onConnected = this._onConnected.filter((i) => i.id !== id);

    return this;
  }

  /** set a "value" in the database at a given path */
  public async set<T extends unknown>(path: string, value: T): Promise<void> {
    // return new Promise((resolve, reject))
    try {
      await this.ref(path).set(value);
      return;
    } catch (e) {
      if (e.code === 'PERMISSION_DENIED') {
        throw new PermissionDenied(
          e,
          `The attempt to set a value at path "${path}" failed due to incorrect permissions.`
        );
      }
      if (
        e.message.indexOf(
          'path specified exceeds the maximum depth that can be written'
        ) !== -1
      ) {
        throw new FileDepthExceeded(e);
      }

      if (
        e.message.indexOf('First argument includes undefined in property') !==
        -1
      ) {
        e.name = 'FirebaseUndefinedValueAssignment';
        throw new UndefinedAssignment(e);
      }

      throw new AbstractedProxyError(
        e,
        'unknown',
        JSON.stringify({ path, value })
      );
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
  public async multiPathSet(updates: IDictionary) {
    const fixed: IDictionary = Object.keys(updates).reduce((acc, path) => {
      const slashPath =
        path.replace(/\./g, '/').slice(0, 1) === '/'
          ? path.replace(/\./g, '/')
          : '/' + path.replace(/\./g, '/');
      acc[slashPath] = updates[path];

      return acc;
    }, {} as IDictionary);
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
  public async update<T = any>(path: string, value: Partial<T>): Promise<void> {
    try {
      await this.ref(path).update(value);
    } catch (e) {
      if (e.code === 'PERMISSION_DENIED') {
        throw new PermissionDenied(
          e,
          `The attempt to update a value at path "${path}" failed due to incorrect permissions.`
        );
      } else {
        throw new AbstractedProxyError(
          e,
          undefined,
          `While updating the path "${path}", an error occurred`
        );
      }
    }
  }

  /**
   * **remove**
   *
   * Removes a path from the database. By default if you attempt to
   * remove a path in the database which _didn't_ exist it will throw
   * a `RealTimeDb/remove` error. If you'd prefer for this
   * error to be ignored than you can pass in **true** to the `ignoreMissing`
   * parameter.
   *
   * [API  Docs](https://firebase.google.com/docs/reference/js/firebase.database.Reference#remove)
   */
  public async remove<T = any>(path: string, ignoreMissing = false) {
    const ref = this.ref(path);
    try {
      await ref.remove();
      return;
    } catch (e) {
      if (e.code === 'PERMISSION_DENIED') {
        throw new PermissionDenied(
          e,
          `The attempt to remove a value at path "${path}" failed due to incorrect permissions.`
        );
      } else {
        throw new AbstractedProxyError(
          e,
          undefined,
          `While removing the path "${path}", an error occurred`
        );
      }
    }
  }

  /**
   * **getSnapshot**
   *
   * returns the Firebase snapshot at a given path in the database
   */
  public async getSnapshot<T = any>(
    path: string | ISerializedQuery<TSdk>
  ): Promise<IRtdbDataSnapshot> {
    try {
      const response = await (typeof path === 'string'
        ? this.ref(slashNotation(path)).once('value')
        : path.setDB(this as unknown as DbFrom<TSdk>).execute());
      return response;
    } catch (e) {
      console.warn(
        `There was a problem trying to get a snapshot from the database [ path parameter was of type "${typeof path}", fn: "getSnapshot()" ]:`,
        e.message
      );

      throw new AbstractedProxyError(e);
    }
  }

  /**
   * **getValue**
   *
   * Returns the JS value at a given path in the database. This method is a
   * typescript _generic_ which defaults to `any` but you can set the type to
   * whatever value you expect at that path in the database.
   */
  public async getValue<T = any>(path: string): Promise<T> {
    try {
      const snap = await this.getSnapshot(path);
      return snap.val() as T;
    } catch (e) {
      throw new AbstractedProxyError(e);
    }
  }

  /**
   * **getRecord**
   *
   * Gets a snapshot from a given path in the Firebase DB
   * and converts it to a JS object where the snapshot's key
   * is included as part of the record (as `id` by default)
   */
  public async getRecord<T = any>(path: string, idProp = 'id'): Promise<T> {
    try {
      const snap = await this.getSnapshot<T>(path);
      let object = snap.val();
      if (typeof object !== 'object') {
        object = { value: snap.val() };
      }

      return { ...object, ...{ [idProp]: snap.key } } as T;
    } catch (e) {
      throw new AbstractedProxyError(e);
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
  public async getList<T extends IModel = any>(
    path: string | ISerializedQuery<TSdk>,
    idProp = 'id'
  ): Promise<T[]> {
    try {
      const snap = await this.getSnapshot<T>(path);
      return snap.val() ? snapshotToArray<T>(snap, idProp) : [];
    } catch (e) {
      throw new AbstractedProxyError(e);
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
  // eslint-disable-next-line @typescript-eslint/require-await
  public async push<T extends unknown>(path: string, value: T) {
    try {
      await this.ref(path).push(value);
    } catch (e) {
      if (e.code === 'PERMISSION_DENIED') {
        throw new PermissionDenied(
          e,
          `The attempt to push a value to path "${path}" failed due to incorrect permissions.`
        );
      } else {
        throw new AbstractedProxyError(
          e,
          undefined,
          `While pushing to the path "${path}", an error occurred`
        );
      }
    }
  }

  /**
   * **exists**
   *
   * Validates the existance of a path in the database
   */
  public async exists(path: string): Promise<boolean> {
    return this.getSnapshot(path).then((snap) => (snap.val() ? true : false));
  }

  /**
   * Sets up an emitter based listener for database connection
   * status. The Client SDK needs this but we will fake this with
   * the Mock DB as well.
   */
  protected _setupConnectionListener() {
    this._eventManager.on('connection', (isConnected: boolean) => {
      if (isConnected) {
        this._onConnected.forEach((listener) =>
          listener.cb(this, listener.ctx || {})
        );
      } else {
        this._onDisconnected.forEach((listener) => {
          listener.cb(this, listener.ctx || {});
        });
      }
    });
  }

  /**
   * Connects the **Firebase** connection events into the general event listener; this only
   * applies to the RTDB Client SDK.
   */
  protected _monitorConnection(snap: IRtdbDataSnapshot) {
    this._isConnected = snap.val();
    this._eventManager.connection(this._isConnected);
  }

  /**
   * Ensure that client and admin SDK's do whatever they need to
   * do to watch for changes in connection status.
   *
   * When a status change is detected it function should **emit**
   * a `connection` event.
   */
  protected abstract _listenForConnectionStatus(): Promise<void>;

  /**
   * When using the **Firebase** Authentication solution, the primary API
   * resides off the `db.auth()` call but each _provider_ also has an API
   * that can be useful and this has links to various providers.
   */
  public get authProviders(): any {
    throw new RealTimeDbError(
      `The authProviders getter is intended to provide access to various auth providers but it is NOT implemented in the connection library you are using!`,
      'missing-auth-providers'
    );
  }
}
