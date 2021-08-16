import { ClientError, EventManager } from './private';
import {
  FireError,
  determineDefaultAppName,
  extractClientConfig,
  getRunningApps,
  getRunningFirebaseApp,
} from '@forest-fire/utility';
import {
  IClientApp,
  IClientAuth,
  IClientAuthProviders,
  IClientConfig,
  IMockConfig,
  IRtdbDataSnapshot,
  SDK,
  isClientConfig,
  isMockConfig,
  ApiKind,
  Database,
  DebuggingCallback,
  IClientRtdbDatabase,
} from '@forest-fire/types';
import { RealTimeDb } from '@forest-fire/real-time-db';

import { firebase } from '@firebase/app';
import { wait } from 'common-types';
import { IDictionary } from 'common-types';

export const MOCK_LOADING_TIMEOUT = 200;
export { IEmitter } from './private';

export class RealTimeClient extends RealTimeDb<SDK.RealTimeClient> {
  public readonly sdk: SDK.RealTimeClient = SDK.RealTimeClient;
  public readonly apiKind: ApiKind.client = ApiKind.client;
  public readonly dbType: Database.RTDB = Database.RTDB;
  public readonly isAdminApi = false;
  /**
   * Uses configuration to connect to the `RealTimeDb` database using the Client SDK
   * and then returns a promise which is resolved once the _connection_ is established.
   */
  public static async connect(
    config?: IClientConfig | IMockConfig
  ): Promise<RealTimeClient> {
    const obj = new RealTimeClient(config);
    await obj.connect();
    return obj;
  }

  /** lists the database names which are currently connected */
  public static connectedTo(): string[] {
    return Array.from(new Set(firebase.apps.map((i) => i.name)));
  }

  public CONNECTION_TIMEOUT = 5000;
  protected _eventManager: EventManager;
  protected declare _database?: IClientRtdbDatabase;
  protected _auth?: IClientAuth;
  protected declare _config: IClientConfig | IMockConfig;
  protected _fbClass: any;
  protected _authProviders: any;
  protected declare _app: IClientApp;

  /**
   * Builds the client and then waits for all to `connect()` to
   * start the connection process.
   */
  constructor(config?: IClientConfig | IMockConfig) {
    super();
    this._fbClass = firebase;
    this._eventManager = new EventManager();
    this.CONNECTION_TIMEOUT = config ? config.timeout || 5000 : 5000;
    if (!config) {
      config = extractClientConfig();
      if (!config) {
        throw new FireError(
          `The client configuration was not set. Either set in the code or use the environment variables!`,
          `invalid-configuration`
        );
      }
    }
    config.name = determineDefaultAppName(config);

    if (isClientConfig(config)) {
      try {
        const runningApps = getRunningApps(firebase.apps);

        this._app = runningApps.includes(config.name)
          ? getRunningFirebaseApp(config.name, firebase.apps)
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

  public async connect(): Promise<void> {
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
  }

  /**
   * access to provider specific providers
   */
  get authProviders(): IClientAuthProviders {
    if (!this._fbClass) {
      throw new ClientError(
        `There was a problem getting the Firebase default export/class!`,
        'missing-firebase'
      );
    }

    if (!this._authProviders) {
      if (!('auth' in this._fbClass)) {
        throw new ClientError(
          `Attempt to get the authProviders getter before connecting to the database!`,
          'missing-auth'
        );
      }
      const providers = (firebase as IDictionary)?.auth
        ? (firebase as IDictionary)?.auth
        : undefined;
      this._authProviders = providers;
    }

    return this._authProviders;
  }

  public async auth(): Promise<IClientAuth> {
    if (!this._app) {
      // await this._loadFirebaseApp()
    }
    if (this._auth) {
      return this._auth;
    }
    if (this.isMockDb) {
      this._auth = this.mock.auth as unknown as IClientAuth;
      return this._auth;
    } else {
      await this._loadAuthApi();
      this._auth = this._app.auth() as any;
    }

    return this._auth;
  }

  /**
   * The steps needed to connect a database to a Firemock
   * mocked DB.
   */
  protected async _connectMockDb(config: IMockConfig): Promise<void> {
    this.getFiremock(config);
    //TODO:
    // this._authProviders = mock.authProviders;
    await this._listenForConnectionStatus();
  }

  protected async _loadAuthApi(): Promise<void> {
    await import(/* webpackChunkName: "firebase-auth" */ '@firebase/auth');
  }

  protected async _loadDatabaseApi(): Promise<void> {
    await import(/* webpackChunkName: "firebase-db" */ '@firebase/database');
  }

  protected async _connectRealDb(config: IClientConfig): Promise<void> {
    if (!this._isConnected) {
      await this._loadDatabaseApi();
      this._database = this._app.database();
      if (config.useAuth) {
        await this._loadAuthApi();
        this._auth = this._app.auth() as any;
      }
      await this._listenForConnectionStatus();
    } else {
      console.info(`Database ${config.name} already connected`);
    }
    // TODO: re-look at debugging func
    if (config.debugging) {
      this.enableDatabaseLogging(
        typeof config.debugging !== 'function'
          ? (message: string) =>
              (config.debugging as DebuggingCallback)(message)
          : (message: string) => console.log('[FIREBASE]', message)
      );
    }
  }

  /**
   * Sets up the listening process for connection status.
   *
   * In addition, will return a promise which resolves at the point
   * the database connects for the first time.
   */
  protected async _listenForConnectionStatus(): Promise<void> {
    this._setupConnectionListener();
    if (!this.isMockDb) {
      // setup ongoing listener
      this.database
        .ref('.info/connected')
        .on('value', (snap: IRtdbDataSnapshot) =>
          this._monitorConnection(snap)
        );
      // detect connection
      if (!this._isConnected) await this._detectConnection();
    } else {
      this._eventManager.connection(true);
    }

    this._isConnected = true;
  }

  protected async _detectConnection(): Promise<void> {
    const connectionEvent = () => {
      // eslint-disable-next-line no-useless-catch
      try {
        return new Promise<void>((resolve, reject) => {
          this._eventManager.once('connection', (state: boolean) => {
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
        'connection-timeout'
      );
    };
    await Promise.race([connectionEvent(), timeout()]);
  }
}
