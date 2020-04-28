import { EventManager } from './EventManager';
import { ClientError } from './ClientError';
import { FirebaseNamespace, FirebaseApp } from '@firebase/app-types';
import { RealTimeDb, IRealTimeDb } from '@forest-fire/real-time-db';
import {
  isMockConfig,
  isClientConfig,
  IClientConfig,
  IClientAuth,
  IMockConfig,
  IRtdbDatabase
} from '@forest-fire/types';
export enum FirebaseBoolean {
  true = 1,
  false = 0
}

export let MOCK_LOADING_TIMEOUT = 200;

export class RealTimeClient extends RealTimeDb implements IRealTimeDb {
  /**
   * Uses configuration to connect to the `RealTimeDb` database using the Client SDK
   * and then returns a promise which is resolved once the _connection_ is established.
   */
  public static async connect(config: IClientConfig | IMockConfig) {
    const obj = new RealTimeClient(config);
    await obj.connect();
    return obj;
  }

  /** lists the database names which are currently connected */
  public static async connectedTo() {
    // tslint:disable-next-line:no-submodule-imports
    const fb = await import(
      /* webpackChunkName: 'firebase-auth' */ '@firebase/app'
    );
    await import(
      /* webpackChunkName: 'firebase-database' */ '@firebase/database'
    );
    return Array.from(new Set(fb.firebase.apps.map(i => i.name)));
  }

  protected _isAdminApi = false;
  protected _eventManager: EventManager;
  protected _database: IRtdbDatabase;
  protected _auth: IClientAuth;
  protected _config: IClientConfig | IMockConfig;
  protected _fbClass:
    | FirebaseNamespace
    | (FirebaseNamespace & { auth: () => FirebaseNamespace['auth'] });
  protected _authProviders: FirebaseNamespace['auth'];
  protected _app: FirebaseApp;

  /**
   * Builds the client and then waits for all to `connect()` to
   * start the connection process.
   */
  constructor(config: IClientConfig | IMockConfig) {
    super();
    this._config = config;
    this._eventManager = new EventManager();
  }

  public async connect(): Promise<RealTimeClient> {
    const config = this._config;
    if (isMockConfig(config)) {
      // MOCK DB
      await this.getFireMock({
        db: config.mockData || {},
        auth: { providers: [], ...config.mockAuth }
      });
      this._authProviders = this._mock
        .authProviders as FirebaseNamespace['auth'];
      this._isConnected = true;
    } else if (isClientConfig(config)) {
      // REAL DB
      if (!this._isConnected) {
        if (isClientConfig(config)) {
          config.name =
            config.name ||
            config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1');
        } else {
          throw new ClientError(
            `The client configuration passed into the database was not correctly formed. The configuration was:\n${JSON.stringify(
              config,
              null,
              2
            )}`
          );
        }

        // tslint:disable-next-line:no-submodule-imports
        const fb = await import(
          /* webpackChunkName: "firebase-app" */ '@firebase/app'
        );
        await import(
          /* webpackChunkName: "firebase-db" */ '@firebase/database'
        );
        if (config.useAuth) {
          await import(
            /* webpackChunkName: "firebase-auth" */ '@firebase/auth'
          );
        }
        try {
          const runningApps = new Set(fb.firebase.apps.map(i => i.name));
          this._app = runningApps.has(config.name)
            ? // TODO: does this connect to the right named DB?
              fb.firebase.app(config.name)
            : fb.firebase.initializeApp(config, config.name);
        } catch (e) {
          if (e.message && e.message.indexOf('app/duplicate-app') !== -1) {
            console.log(
              `The "${config.name}" app already exists; will proceed.`
            );
            this._isConnected = true;
          } else {
            throw e;
          }
          this.listenForConnectionStatus();
        }
        this._fbClass = fb.default;
        this._database = this._app.database();
      } else {
        console.info(`Database ${config.name} already connected`);
      }
      // TODO: relook at debugging func
      if (config.debugging) {
        this.enableDatabaseLogging(
          typeof config.debugging === 'function'
            ? (message: string) => (config.debugging as any)(message)
            : (message: string) => console.log('[FIREBASE]', message)
        );
      }
    } else {
      throw new Error(
        `The configuration is of an unknown type: ${JSON.stringify(config)}`
      );
    }

    return this;
  }

  /**
   * access to provider specific providers
   */
  get authProviders(): FirebaseNamespace['auth'] {
    if (!this._fbClass) {
      throw new ClientError(
        `There was a problem getting the Firebase default export/class!`
      );
    }

    if (!this._authProviders) {
      if (!this._fbClass.auth) {
        throw new ClientError(
          `Attempt to get the authProviders getter before connecting to the database!`
        );
      }
      this._authProviders = this._fbClass.auth;
    }

    return this._authProviders;
  }

  public async auth(): Promise<IClientAuth> {
    if (this._auth) {
      return this._auth;
    }
    if (!this.isConnected) {
      await this.connect();
    }
    if (this._mocking) {
      this._auth = await this.mock.auth();
      return this._auth;
    }
    this._auth = this._app.auth() as IClientAuth;
    return this._auth;
  }

  /**
   * Sets up the listening process for connection status
   */
  protected listenForConnectionStatus() {
    if (!this._mocking) {
      this._database
        .ref('.info/connected')
        .on('value', snap => this._monitorConnection.bind(this)(snap));
    } else {
      // console.info(`Listening for connection changes on Mock DB`);
    }
  }
}
