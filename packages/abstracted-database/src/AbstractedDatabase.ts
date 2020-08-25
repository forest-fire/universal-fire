import type {
  IAdminApp,
  IAdminAuth,
  IClientApp,
  IClientAuth,
  IDatabaseConfig,
  IFirestoreDatabase,
  IRtdbDatabase,
  SDK,
  IClientAuthProviders,
  ISerializedQuery,
  IAbstractedEvent,
  IMockConfigOptions,
  Database,
  IBaseAbstractedDatabase,
} from '@forest-fire/types';
import type { Mock as MockDb } from 'firemock';
import { FireError } from '@forest-fire/utility';
import { AbstractedDatabaseError } from './index';

export abstract class AbstractedDatabase implements IBaseAbstractedDatabase {
  /** the Firbase client used to gain DB access */
  public readonly sdk: SDK;
  public readonly dbType: Database;

  /**
   * Indicates if this connection is exposing the Admin API/SDK
   */
  public readonly isAdminApi: boolean = false;

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
   * Provides a set of API's that are exposed by the various "providers". Examples
   * include "emailPassword", "github", etc.
   *
   * > **Note:** this is only really available on the Client SDK's
   */
  public get authProviders(): IClientAuthProviders {
    throw new FireError(`Only the client SDK's have a authProviders property`);
  }

  public get app(): any {
    if (!this._app) {
      throw new AbstractedDatabaseError(
        `Failed to return the Firebase "app" as this has not yet been asynchronously loaded yet`,
        'not-ready'
      );
    }
    return this._app;
  }

  /**
   * Returns a type safe accessor to the database; when the database has not been set yet
   * it will throw a `not-ready` error.
   */
  protected abstract get database(): IRtdbDatabase | IFirestoreDatabase;

  /**
   * Connects to the database and returns a promise which resolves when this
   * connection has been established.
   */
  public abstract async connect(): Promise<any>;
  public abstract async auth(): Promise<IClientAuth | IAdminAuth>;
  public get isMockDb() {
    return this._config.mocking;
  }
  public get config() {
    return this._config;
  }

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

  public get isConnected() {
    return this._isConnected;
  }

  public abstract async getList<T = any>(
    path: string | ISerializedQuery<T>,
    idProp?: string
  ): Promise<T[]>;
  public abstract async getPushKey(path: string): Promise<string>;
  public abstract async getRecord<T = any>(
    path: string,
    idProp?: string
  ): Promise<T>;
  public abstract async getValue<T = any>(path: string): Promise<T | void>;

  public abstract async update<T = any>(
    path: string,
    value: Partial<T>
  ): Promise<void>;

  public abstract async set<T = any>(path: string, value: T): Promise<void>;

  public abstract async remove(
    path: string,
    ignoreMissing?: boolean
  ): Promise<any>;

  public abstract watch(
    target: string | ISerializedQuery,
    events: IAbstractedEvent | IAbstractedEvent[],
    cb: any
  ): void;

  public abstract unWatch(
    events?: IAbstractedEvent | IAbstractedEvent[],
    cb?: any
  ): void;
  /**
   * Returns a reference for a given path in Firebase
   */
  public abstract ref(path?: string): any;

  /**
   * **getFiremock**
   *
   * Asynchronously imports the `firemock` library and _prepares_ it
   * for use. When the promise resolves from this method the class's
   * `_mock` property will be setup with a proper mock API.
   *
   * > because this is an optional requirement for consumers it will
   * wrap with a try/catch and produce a graceful error message
   * if an error is encountered.
   */
  protected async getFiremock(config: IMockConfigOptions = {}) {
    let Firemock;
    try {
      Firemock = await import(/* webpackChunkName: "firemock" */ 'firemock');
    } catch (e) {
      throw new FireError(
        `To use mocking functions you must ensure that "firemock" is installed in your repo. Typically this would be installed as a "devDep" assuming that this mocking functionality is used as part of your tests but if you are shipping this mocking functionality then you will need to add it as full dependency.\n\n${e.message}`,
        'missing-dependency'
      );
    }

    try {
      this._mock = await Firemock.Mock.prepare(config, this.sdk);
    } catch (e) {
      throw new FireError(
        `The firemock library was imported successfully but in trying to "prepare" it there was a failure: ${e.message}`,
        'failed-mock-prep'
      );
    }
  }
}
