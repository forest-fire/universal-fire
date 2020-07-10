import {
  determineDefaultAppName,
  extractDataUrl,
  extractServiceAccount,
  getRunningApps,
  FireError,
} from '@forest-fire/utility';
import {
  IAbstractedDatabase,
  IAdminApp,
  IAdminAuth,
  IAdminConfig,
  IAdminRtdbDatabase,
  IMockConfig,
  SDK,
  isAdminConfig,
  isMockConfig,
  IAdminFirebaseNamespace,
} from '@forest-fire/types';
import { IRealTimeDb, RealTimeDb } from '@forest-fire/real-time-db';

import { EventManager } from './EventManager';
import { RealTimeAdminError } from './errors/RealTimeAdminError';
import { adminAuthSdk } from 'firemock';
import { debug } from './util';

export class RealTimeAdmin extends RealTimeDb
  implements IRealTimeDb, IAbstractedDatabase {
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

  protected _admin?: IAdminFirebaseNamespace;
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
    this._config = config;
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
    //TODO: check this typing
    return (this._admin.auth() as unknown) as IAdminAuth;
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
    await this.getFireMock({
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

  protected _initializeApp() {
    if (!this._admin) {
      throw new FireError(
        `Can not initialize app before first loading the Admin API!`,
        'not-ready'
      );
    }

    try {
      this._admin.initializeApp(this._config as IAdminConfig);
    } catch (e) {
      throw new FireError(
        `There were problems with the credentials provided to RealTimeAdmin! The error reported was:\n\n${e.message}\n`,
        'invalid-credentials'
      );
    }
  }

  protected async _connectRealDb(config: IAdminConfig) {
    if (!this._admin) {
      this._admin = await this._loadAdminApi();
    }
    if (this.isConnected && this.app && this.database) {
      return;
    }
    // look for existing instance of the app
    const found = this._admin.apps.find((i) => i.name === this.config.name);
    console.log({ config: this._config });
    if (found) {
      console.debug(
        `The Firebase App "${this.config.name}" was found; reusing this App instance.`
      );
      if (found.database && typeof found.database === 'function') {
        console.debug(
          `The Firebase App API is providing a database function endpoint indicating that the app is not initialized`
        );
        // this._initializeApp();
        this._database = found.database();
      }
    } else {
      console.debug(
        `The Firebase App "${this.config.name}" was NOT found; creating now.`
      );
      this._initializeApp();
      this._app = this._admin.app();
      this._database = this._app.database();
    }

    // use found app or instance's app to instatiate the database API
    if (found && found.database) {
      this._app = found;
      this._database =
        typeof found.database == 'function'
          ? found.database()
          : ((found.database as unknown) as IAdminRtdbDatabase);
    } else if (
      this._app &&
      this._app.database &&
      typeof this._app.database === 'function'
    ) {
      this._database = this._app.database();
    } else if (!this._app) {
      this._initializeApp();

      try {
        const app = this._admin.app(this._config.name);
        this._app = app;
        if (this._app && this._app.database) {
          this._database = this._app.database();
        } else {
          if (!this._app) {
            throw new FireError(
              `The attemp to instantiate the App API didn't throw an error but didn't return the API!`,
              'invalid-app'
            );
          }
          throw new FireError(
            `The Firebase App API was instantiated but for unknown reasons it is not providing the appopriate API surface to continue! The App API exposes the following properties ${Object.keys(
              this._app
            ).join(', ')} but not the required "database()" function!`,
            'invalid-app'
          );
        }
      } catch (e) {
        if (e.universalFire) {
          throw e;
        }
        throw new FireError(
          `An unexpected error was encountered while trying to setup Firebase's database API!\n\n${e.message}`,
          'no-database-api'
        );
      }
    } else {
      throw new FireError(
        `Failed to instantiate Firebase's Real Time Database API due to missing resources that are required. In order to start a valid Firebase APP Api must be used and we couldn't set this up!\n${JSON.stringify(
          { found: found ? true : false, type: typeof found.database },
          null,
          2
        )}`,
        'missing-app-api'
      );
    }

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
