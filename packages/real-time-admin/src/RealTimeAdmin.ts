// TODO: reduce this to just named symbols which we need!
import firebase from 'firebase-admin';
import { RealTimeDb, IRealTimeDb } from '@forest-fire/real-time-db';
import { EventManager } from './EventManager';
import { debug } from './util';
import {
  IAdminConfig,
  IMockConfig,
  isMockConfig,
  isAdminConfig,
  IAdminAuth,
  IAdminApp,
  IAdminRtdbDatabase,
  SDK,
} from '@forest-fire/types';
import {
  extractServiceAccount,
  FireError,
  getRunningApps,
  extractDataUrl,
  getRunningFirebaseApp,
  determineDefaultAppName,
} from '@forest-fire/utility';
import { RealTimeAdminError } from './errors/RealTimeAdminError';
import { adminAuthSdk } from 'firemock';

export class RealTimeAdmin extends RealTimeDb implements IRealTimeDb {
  sdk = SDK.RealTimeAdmin;
  /**
   * Instantiates a DB and then waits for the connection
   * to finish before resolving the promise.
   */
  public static async connect(config?: IAdminConfig | IMockConfig) {
    const obj = new RealTimeAdmin(config);
    await obj.connect();
    return obj;
  }

  private static _connections: IAdminApp[] = [];

  public static get connections() {
    return RealTimeAdmin._connections.map((i) => i.name);
  }

  protected _eventManager: EventManager;
  protected _clientType = 'admin';
  protected _isAuthorized: boolean = true;
  protected _auth?: IAdminAuth;
  protected _config: IAdminConfig | IMockConfig;
  protected _app!: IAdminApp;
  protected _database?: IAdminRtdbDatabase;
  protected _isAdminApi = true;

  constructor(config?: IAdminConfig | IMockConfig) {
    super();
    this._eventManager = new EventManager();
    this.CONNECTION_TIMEOUT = config ? config.timeout || 5000 : 5000;
    config = {
      ...config,
      serviceAccount: extractServiceAccount(config),
      databaseURL: extractDataUrl(config),
      name: determineDefaultAppName(config),
    } as IAdminConfig | IMockConfig;
    if (isAdminConfig(config)) {
      this._config = config
      const runningApps = getRunningApps(firebase.apps);
      RealTimeAdmin._connections = firebase.apps;
      const credential = firebase.credential.cert(config.serviceAccount);
      this._app = runningApps.includes(this._config.name)
        ? getRunningFirebaseApp<IAdminApp>(
          config.name,
          (firebase.apps as unknown) as IAdminApp[]
        )
        : firebase.initializeApp(
          {
            credential,
            databaseURL: config.databaseURL,
          },
          config.name
        );
    } else if (isMockConfig(config)) {
      this._config = config
    } else {
      throw new FireError(
        `The configuration sent into an Admin SDK abstraction was invalid and may be a client SDK configuration instead. The configuration was: \n${JSON.stringify(
          config,
          null,
          2
        )}`,
        'invalid-configuration'
      );
    }
  }

  public get database(): IAdminRtdbDatabase {
    if (this.config.mocking) {
      throw new RealTimeAdminError(
        `The "database" provides direct access to the Firebase database API when using a real database but not when using a Mock DB!`,
        'not-allowed'
      );
    }
    if (!this._database) {
      throw new RealTimeAdminError(
        `The "database" object was accessed before it was established as part of the "connect()" process!`,
        'not-allowed'
      );
    }
    return this._database;
  }

  /**
   * Provides access to the Firebase Admin Auth API.
   *
   * > If using a _mocked_ database then the Auth API will be redirected to **firemock**
   * instead of the real Admin SDK for Auth. Be aware that this mocked API may not be fully implemented
   * but PR's are welcome if the part you need is not yet implemented. If you want to explicitly state
   * whether to use the _real_ or _mock_ Auth SDK then you can state this by passing in a `auth` parameter
   * as part of the configuration (using either "real" or "mocked" as a value)
   *
   * References:
   * - [Introduction](https://firebase.google.com/docs/auth/admin)
   * - [API](https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth)
   */
  public async auth(): Promise<IAdminAuth> {
    if (this._config.mocking) {
      return adminAuthSdk;
    }
    return firebase.auth(this._app);
  }

  public goOnline() {
    if (this._database) {
      try {
        this._database.goOnline();
      } catch (e) {
        debug('There was an error going online:' + e);
      }
    } else {
      console.warn(
        'Attempt to use goOnline() prior to having a database connection!'
      );
    }
  }

  public goOffline() {
    if (this._database) {
      this._database.goOffline();
    } else {
      console.warn(
        'Attempt to use goOffline() prior to having a database connection!'
      );
    }
  }

  public get isConnected() {
    if (this.isMockDb) {
      return this._isConnected;
    }

    return (
      this._app &&
      this.config &&
      this.config.name &&
      getRunningApps(firebase.apps).includes(this.config.name)
    );
  }

  public async connect(): Promise<RealTimeAdmin> {
    if (isMockConfig(this._config)) {
      await this._connectMockDb(this._config);
    } else if (isAdminConfig(this._config)) {
      await this._connectRealDb(this._config);
    } else {
      throw new RealTimeAdminError(
        'The configuation passed is not valid for an admin SDK!',
        'invalid-configuration'
      );
    }

    return this;
  }

  protected async _connectMockDb(config: IMockConfig) {
    await this.getFireMock({
      db: config.mockData || {},
      auth: { providers: [], ...config.mockAuth },
    });
    this._isConnected = true;
    return this;
  }

  protected async _connectRealDb(config: IAdminConfig) {
    const found = firebase.apps.find((i) => i.name === this.config.name);
    this._database = (found &&
      found.database &&
      typeof found.database !== 'function'
      ? found.database
      : this._app.database()) as IAdminRtdbDatabase;
    this.enableDatabaseLogging = firebase.database.enableLogging.bind(
      firebase.database
    );
    this.goOnline();
    this._eventManager.connection(true);
    await this._listenForConnectionStatus();
    if (this.isConnected) {
      console.info(
        `Database ${this.app.name} was already connected. Reusing connection.`
      );
    }
  }

  /**
   * listenForConnectionStatus
   *
   * in the admin interface we assume that ONCE connected
   * we remain connected; this is unlike the client API
   * which provides an endpoint to lookup
   */
  protected async _listenForConnectionStatus() {
    this._setupConnectionListener();
    this._eventManager.connection(true);
  }
}
