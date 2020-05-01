import { EventManager } from './EventManager';
import { ClientError } from './ClientError';
import type { FirebaseNamespace } from '@firebase/app-types';
import { RealTimeDb, IRealTimeDb } from '@forest-fire/real-time-db';
import {
  isMockConfig,
  isClientConfig,
  IClientConfig,
  IClientAuth,
  IMockConfig,
  IRtdbDatabase,
  IClientApp,
  IRtdbDataSnapshot
} from '@forest-fire/types';
import {
  extractClientConfig,
  FireError,
  getRunningApps,
  getRunningFirebaseApp,
  determineDefaultAppName
} from '@forest-fire/utility';
export enum FirebaseBoolean {
  true = 1,
  false = 0
}
import { firebase } from '@firebase/app';
import { wait } from 'common-types';

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
  protected _database?: IRtdbDatabase;
  protected _auth: IClientAuth;
  protected _config: IClientConfig | IMockConfig;
  protected _fbClass:
    | FirebaseNamespace
    | (FirebaseNamespace & { auth: () => FirebaseNamespace['auth'] });
  protected _authProviders: FirebaseNamespace['auth'];
  protected _app: IClientApp;

  /**
   * Builds the client and then waits for all to `connect()` to
   * start the connection process.
   */
  constructor(config?: IClientConfig | IMockConfig) {
    super();
    this._eventManager = new EventManager();
    this.CONNECTION_TIMEOUT = config ? config.timeout || 5000 : 5000;
    if (!config) {
      config = extractClientConfig();
      if (!config) {
        throw new FireError(`The client configuration was not set. Either set in the code or use the environment variables!`, `invalid-configuration`);
      }
    }
    config.name = determineDefaultAppName(config)

    if (isClientConfig(config)) {
      try {
        const runningApps = getRunningApps(firebase.apps);
        this._app = runningApps.includes(config.name)
          ? getRunningFirebaseApp<IClientApp>(config.name, firebase.apps)
          : firebase.initializeApp(config, config.name);
      } catch (e) {
        if (e.message && e.message.indexOf('app/duplicate-app') !== -1) {
          console.log(`The "${config.name}" app already exists; will proceed.`);
        } else {
          throw e;
        }
      }
    } else if (!isMockConfig(config)) {
      throw new FireError(
        `The configuration passed to RealTimeClient was invalid!`,
        `invalid-configuration`
      );
    }
    this._config = config;
  }

  public async connect(): Promise<RealTimeClient> {
    if (isMockConfig(this._config)) {
      await this._connectMockDb(this._config);
    } else if (isClientConfig(this._config)) {
      await this._connectRealDb(this._config);
    } else {
      throw new Error(
        `The configuration is of an unknown type: ${JSON.stringify(
          this._config
        )}`
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
        `There was a problem getting the Firebase default export/class!`, 'missing-firebase'
      );
    }

    if (!this._authProviders) {
      if (!this._fbClass.auth) {
        throw new ClientError(
          `Attempt to get the authProviders getter before connecting to the database!`, 'missing-auth'
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
      this._config.useAuth = true;
      await this.connect();
    }
    if (this.isMockDb) {
      this._auth = await this.mock.auth();
      return this._auth;
    }
    if (!this._app.auth) {
      await this.loadAuthApi()
    }
    this._auth = this._app.auth() as IClientAuth;
    return this._auth;
  }

  /**
   * The steps needed to connect a database to a Firemock
   * mocked DB.
   */
  protected async _connectMockDb(config: IMockConfig) {
    await this.getFireMock({
      db: config.mockData || {},
      auth: { providers: [], ...config.mockAuth }
    });
    this._authProviders = this._mock.authProviders as FirebaseNamespace['auth'];    
    await this._listenForConnectionStatus();
  }

  protected async _connectRealDb(config: IClientConfig) {
    if (!this._isConnected) {
      await this.loadDatabaseApi();
      this._database = this._app.database();
      if (config.useAuth) {
        await this.loadAuthApi();
        this._auth = this._app.auth()
      }
      await this._listenForConnectionStatus();
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
  }

  protected async loadAuthApi() {
    await import(/* webpackChunkName: "firebase-auth" */ '@firebase/auth');
  }

  protected async loadDatabaseApi() {
    await import(/* webpackChunkName: "firebase-db" */ '@firebase/database');
  }

  /**
   * Sets up the listening process for connection status.
   * 
   * In addition, will return a promise which resolves at the point
   * the database connects for the first time.
   */
  protected async _listenForConnectionStatus() {
    this._setupConnectionListener()
    if (!this.isMockDb) {
      // setup ongoing listener
      this.database
        .ref('.info/connected')
        .on('value', (snap: IRtdbDataSnapshot) => this._monitorConnection.bind(this)(snap));
      // detect connection
      if(!this._isConnected) await this._detectConnection();
    } else {
      this._eventManager.connection(true)
    }
    
    this._isConnected = true
  }

  protected async _detectConnection() {
    const connectionEvent = () => {
      try {
        return new Promise((resolve, reject) => {
          this._eventManager.once("connection", (state: boolean) => {
            if (state) {
              resolve();
            } else {
              reject(
                new ClientError(
                  `While waiting for a connection received a disconnect message instead`,
                  `no-connection`
                )
              );
            }
          });
        });
      } catch (e) {
        throw e;
      }
    };

    const timeout = async () => {
      await wait(this.CONNECTION_TIMEOUT);
      throw new ClientError(
        `The database didn't connect after the allocated period of ${this.CONNECTION_TIMEOUT}ms`,
        "connection-timeout"
      );
    };
    await Promise.race([connectionEvent(), timeout()]);
  }
}
