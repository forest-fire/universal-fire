// TODO: reduce this to just named symbols which we need!
import * as firebase from 'firebase-admin';
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
import { IDictionary } from '@forest-fire/types/node_modules/common-types';

export class RealTimeAdmin extends RealTimeDb implements IRealTimeDb {
  /**
   * Instantiates a DB and then waits for the connection
   * to finish before resolving the promise.
   */
  public static async connect(config?: IAdminConfig | IMockConfig) {
    const obj = new RealTimeAdmin(config);
    await obj.connect();
    return obj;
  }

  private static _connections: IDictionary<IAdminApp> = {};

  public static get connections() {
    return RealTimeAdmin._connections;
  }

  public static addConnection(app: IAdminApp) {
    if (RealTimeAdmin._connections[app.name]) {
      throw new RealTimeAdminError(
        `Attempt to add app with name that already exists! [${app.name}]`,
        'not-allowed'
      );
    }
    RealTimeAdmin._connections[app.name] = app;
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

      const runningApps = getRunningApps(firebase.apps);
      const credential = firebase.credential.cert(config.serviceAccount);
      this.app = runningApps.includes(config.name)
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
      config.name = determineDefaultAppName(config);
      this._config = config;
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

  protected get app() {
    if (this._app) {
      return this._app;
    }
    throw new FireError(
      'Attempt to access Firebase App without having instantiated it'
    );
  }

  protected set app(value: IAdminApp) {
    this._app = value;
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
      this.app &&
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
    this._database = (found
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
