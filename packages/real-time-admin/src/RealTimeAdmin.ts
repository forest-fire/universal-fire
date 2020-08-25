import {
  determineDefaultAppName,
  extractDataUrl,
  extractServiceAccount,
  getRunningApps,
  FireError,
  initializeAdminApp,
} from '@forest-fire/utility';
import {
  IAdminApp,
  IAdminAuth,
  IAdminConfig,
  IAdminRtdbDatabase,
  IMockConfig,
  SDK,
  isAdminConfig,
  isMockConfig,
  IAdminFirebaseNamespace,
  IRealTimeAdmin,
  ApiKind,
} from '@forest-fire/types';
import { RealTimeDb } from '@forest-fire/real-time-db';

import { EventManager } from './EventManager';
import { RealTimeAdminError } from './errors/RealTimeAdminError';
import { debug } from './util';

export class RealTimeAdmin extends RealTimeDb implements IRealTimeAdmin {
  public readonly sdk: SDK.RealTimeAdmin = SDK.RealTimeAdmin;
  public readonly apiKind: ApiKind.admin = ApiKind.admin;
  public readonly isAdminApi = true;

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
  /** add an App connection to the managed pool */
  private static addConnection(connection: IAdminApp) {
    RealTimeAdmin._connections = RealTimeAdmin._connections.concat(connection);
  }

  public static get connections() {
    return RealTimeAdmin._connections.map((i) => i.name);
  }

  protected _admin?: IAdminFirebaseNamespace;
  protected _eventManager: EventManager;
  protected _clientType = 'admin';
  protected _isAuthorized: boolean = true;
  protected _auth?: IAdminAuth;
  protected _config: IAdminConfig | IMockConfig;
  protected _app!: IAdminApp;
  protected _database?: IAdminRtdbDatabase;

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
    this._config = config;
  }

  public get app(): IAdminApp {
    if (!this._app) {
      throw new RealTimeAdminError(
        `Attempt to access the "app" property from RealTimeAdmin before it has been loaded. Be sure that all Firebase async requirements are loaded first`,
        'not-ready'
      );
    }
    return this._app;
  }

  public get database(): IAdminRtdbDatabase {
    if (this._config.mocking) {
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
      // TODO: Fix Firemock to export just the admin API; auth management should be done through a different
      // entry point. Also the name should be something more like `adminAuth` not `adminSdk`
      return (this._mock.adminSdk as unknown) as IAdminAuth;
    }

    if (!this._admin) {
      this._admin = await this._loadAdminApi();
      this._app = initializeAdminApp(this._admin, this._config);
    }
    return this._admin.auth();
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
      getRunningApps(this._admin.apps).includes(this.config.name)
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
    await this.getFiremock({
      db: config.mockData || {},
      auth: { providers: [], ...config.mockAuth },
    });
    this._isConnected = true;
    return this;
  }

  protected async _loadAdminApi() {
    try {
      const api = ((await import(
        'firebase-admin'
      )) as unknown) as IAdminFirebaseNamespace;
      return api;
    } catch (e) {
      throw new FireError(
        `Attempt to instantiate Firebase's admin SDK failed. This is likely because you have not installed the "firebase-admin" npm package as a dependency of your project. The precise error received when trying to instantiate was:\n\n${e.message}`,
        'invalid-import'
      );
    }
  }

  protected async _connectRealDb(config: IAdminConfig) {
    if (!this._admin) {
      this._admin = (await this._loadAdminApi()) as IAdminFirebaseNamespace;
    }
    if (this.isConnected && this._database) {
      return;
    }
    // look for existing instance of the app
    const name = determineDefaultAppName(config);
    const found = this._admin.apps.find((i) => i.name === name);

    try {
      if (found) {
        this._app = found;
      } else {
        this._app = initializeAdminApp(this._admin, this._config);
        RealTimeAdmin.addConnection(this._app);
      }

      this._database = this._app.database();
    } catch (e) {
      if (e.universalFire) {
        throw e;
      }
      throw new FireError(
        `An unexpected error was encountered while trying to setup Firebase's database API!\n\n${e.message}`,
        'no-database-api'
      );
    }

    this.goOnline();
    this._eventManager.connection(true);
    await this._listenForConnectionStatus();
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
