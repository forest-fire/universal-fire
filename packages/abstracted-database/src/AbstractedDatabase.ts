import type {
  IAdminApp,
  IAdminAuth,
  IClientApp,
  IClientAuth,
  IDatabaseConfig,
  IFirestoreDatabase,
  IFirestoreDbEvent,
  IRtdbDatabase,
  IRtdbDbEvent,
  SDK,
  IClientAuthProviders,
} from '@forest-fire/types';
import type { Mock as MockDb } from 'firemock';
import {
  BaseSerializer,
  SerializedRealTimeQuery,
  SerializedFirestoreQuery,
} from '@forest-fire/serialized-query';
import { FireError } from '@forest-fire/utility';

export abstract class AbstractedDatabase {
  public readonly sdk: SDK;
  /**
   * Indicates if the database is using the admin SDK.
   */
  protected _isAdminApi: boolean = false;
  /**
   * Indicates if the database is connected.
   */
  protected _isConnected: boolean = false;
  /**
   * The mock API provided by **firemock**
   */
  protected _mock?: MockDb;
  /**
   * The Firebase App API.
   */
  protected _app?: IAdminApp | IClientApp;
  /**
   * The database API provided by Firebase (admin or client sdk of either
   * Firestore or RTDB)
   */
  protected _database?: IRtdbDatabase | IFirestoreDatabase;
  /**
   * The configuration to connect to the database; based on
   * subclass this will be either a _client_ or _admin_ configuration
   * OR a _mock_ configuration.
   */
  protected abstract _config: IDatabaseConfig;
  /**
   * The auth API.
   */
  protected abstract _auth?: IAdminAuth | IClientAuth;
  /**
   * Returns key characteristics about the Firebase app being managed.
   */
  public get app() {
    if (this.config.mocking) {
      throw new FireError(
        `The "app" object is provided as direct access to the Firebase API when using a real database but not when using a Mock DB!`,
        'not-allowed'
      );
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
    throw new FireError(
      'Attempt to access Firebase App without having instantiated it'
    );
  }

  /**
   * Provides a set of API's that are exposed by the various "providers". Examples
   * include "emailPassword", "github", etc.
   */
  public get authProviders(): IClientAuthProviders {
    throw new FireError(`Only the client SDK's have a authProviders property`);
  }

  /**
   * Returns a type safe accessor to the database; when the database has not been set yet
   * it will throw a `not-ready` error.
   */
  protected abstract get database(): IRtdbDatabase | IFirestoreDatabase;
  /**
   * Sets the `_database`.
   */
  protected abstract set database(value: IRtdbDatabase | IFirestoreDatabase);
  /**
   * Connects to the database and returns a promise which resolves when this
   * connection has been established.
   */
  public abstract async connect(): Promise<any>;
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
   * The configuration used to setup/configure the database.
   */
  public get config() {
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
   * Returns true if the database is connected, false otherwis.
   */
  public get isConnected() {
    return this._isConnected;
  }
  /**
   * Get a list of a given type (defaults to _any_). Assumes that the "key" for
   * the record is the `id` property but that can be changed with the optional
   * `idProp` parameter.
   */
  public abstract async getList<T = any>(
    path: string | BaseSerializer<T>,
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
    path: string | BaseSerializer<T>,
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
  public abstract async remove(
    path: string,
    ignoreMissing?: boolean
  ): Promise<any>;

  // TODO: improve the signature for a callback in watch/unWatch

  /**
   * Watch for Firebase events based on a DB path.
   */
  public abstract watch(
    target: string | BaseSerializer,
    events:
      | IFirestoreDbEvent
      | IFirestoreDbEvent[]
      | IRtdbDbEvent
      | IRtdbDbEvent[],
    cb: any
  ): void;
  /**
   * Unwatches existing Firebase events.
   */
  public abstract unWatch(
    events?:
      | IFirestoreDbEvent
      | IFirestoreDbEvent[]
      | IRtdbDbEvent
      | IRtdbDbEvent[],
    cb?: any
  ): void;
  /**
   * Returns a reference for a given path in Firebase
   */
  public abstract ref(path?: string): any;
}
