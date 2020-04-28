import {
  ISerializedQuery,
  IDatabaseConfig,
  MockDb,
  IRtdbDatabase,
  IFirestoreDatabase,
  IRtdbEventType,
  IFirestoreDbEvent,
  IClientAuth,
  IAdminAuth,
  IAdminFirebaseApp,
  IFirebaseApp
} from '@forest-fire/types';
import { FireError } from '@forest-fire/utility';
export { MockDb };

export abstract class AbstractedDatabase {
  /**
   * The configuration used to setup/configure the database.
   */
  public get config() {
    return this._config;
  }

  /**
   * the configuration to connect to the database; based on
   * subclass this will be either a _client_ or _admin_ configuration
   * OR a _mock_ configuration.
   */
  protected abstract _config: IDatabaseConfig;

  /**
   * Indicates if the database is using the admin SDK.
   */
  protected _isAdminApi: boolean = false;
  /**
   * The mock API provided by **firemock**
   */
  protected _mock: MockDb | undefined;
  /**
   * The Firebase App API.
   */
  protected _app: IFirebaseApp | IAdminFirebaseApp | undefined;
  /**
   * The database API provided by Firebase (admin or client sdk of either
   * Firestore or RTDB)
   */
  protected _database: IRtdbDatabase | IFirestoreDatabase | undefined;
  /**
   * Returns the `_app`.
   */
  protected get app() {
    if (this._app) {
      return this._app;
    }
    throw new Error(
      'Attempt to access Firebase App without having instantiated it'
    );
  }
  /**
   * Sets the `_app`.
   */
  protected set app(value) {
    this._app = value;
  }

  // TODO: why do we need this getter/setter? This is protected so why not just use a variable;
  // getter/setter doesn't seem to add value. Also since I already had the `_database` prop I just
  // moved the implementation to use this more traditional naming convention of non-public variables

  // /**
  //  * Returns the `_database`.
  //  */
  // protected get database(): IRtdbDatabase | FirebaseFirestore {
  //   return this._database;
  // }
  // /**
  //  * Sets the `_database`.
  //  */
  // protected abstract set database(value: IRtdbDatabase | FirebaseFirestore);

  // TODO: review with rationalle with Marcello
  /**
   * Connects to the database and returns a promise which resolves when this
   * connection has been established.
   */
  abstract async connect(): Promise<any>;

  /**
   * Returns the authentication API of the database.
   */
  public abstract async auth(): Promise<IClientAuth | IAdminAuth>;

  /**
   * Indicates if the database is using the admin SDK.
   */
  public get isAdminApi() {
    return this._isAdminApi;
  }
  /**
   * Indicates if the database is a mock database or not
   */
  public get isMockDb() {
    return this._config.mocking;
  }
  /**
   * Returns the mock API provided by **firemock**
   * which in turn gives access to the actual database _state_ off of the
   * `db` property.
   *
   * This is only available if the database has been configured as a mocking database; if it is _not_
   * a mocked database a `AbstractedDatabase/not-allowed` error will be thrown.
   */
  public get mock(): MockDb {
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
   * Get a list of a given type (defaults to _any_). Assumes that the "key" for
   * the record is the `id` property but that can be changed with the optional
   * `idProp` parameter.
   */
  public abstract async getList<T = any>(
    path: string | ISerializedQuery,
    idProp?: string
  ): Promise<T[]>;
  /**
   * Get's a push-key from the server at a given path. This ensures that
   * multiple client's who are writing to the database will use the server's
   * time rather than their own local time.
   *
   * @param path the path in the database where the push-key will be pushed to
   */
  public abstract async getPushKey(path: string): Promise<string>;
  /**
   * Gets a record from a given path in the Firebase DB and converts it to an
   * object where the record's key is included as part of the record.
   */
  public abstract async getRecord<T = any>(
    path: string,
    idProp?: string
  ): Promise<T>;
  /**
   * Returns the value at a given path in the database. This method is a
   * typescript _generic_ which defaults to `any` but you can set the type to
   * whatever value you expect at that path in the database.
   */
  public abstract async getValue<T = any>(path: string): Promise<T | void>;
  /**
   * Updates the database at a given path. Note that this operation is
   * **non-destructive**, so assuming that the value you are passing in a
   * POJO/object then the properties sent in will be updated but if properties
   * that exist in the DB, but not in the value passed in then these properties
   * will _not_ be changed.
   */
  public abstract async update<T = any>(
    path: string,
    value: Partial<T>
  ): Promise<void>;
  /**
   * Sets a value in the database at a given path.
   */
  public abstract async set<T = any>(path: string, value: T): Promise<void>;
  /**
   * Removes a path from the database.
   */
  public abstract async remove(path: string): Promise<any>;
  /**
   * Watch for Firebase events based on a DB path.
   */
  public abstract watch(
    target: string | ISerializedQuery,
    events:
      | IFirestoreDbEvent
      | IFirestoreDbEvent[]
      | IRtdbEventType
      | IRtdbEventType[],
    cb: any
  ): void;
  /**
   * Unwatches existing Firebase events.
   */
  public abstract unWatch(
    events?:
      | IFirestoreDbEvent
      | IFirestoreDbEvent[]
      | IRtdbEventType
      | IRtdbEventType[],
    cb?: any
  ): void;
  /**
   * Returns a reference for a given path in Firebase
   */
  public abstract ref(path?: string): any;
}
