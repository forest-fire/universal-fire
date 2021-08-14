import {
  FireError,
  extractClientConfig,
  getRunningApps,
  getRunningFirebaseApp,
} from '@forest-fire/utility';
import { FirestoreDb } from '@forest-fire/firestore-db';
import {
  IClientApp,
  IClientAuth,
  IClientConfig,
  IMockConfig,
  SDK,
  isClientConfig,
  isMockConfig,
  FirebaseNamespace,
  IClientFirestoreDatabase,
  ApiKind,
  Database,
} from '@forest-fire/types';

export class FirestoreClient extends FirestoreDb<'FirestoreClient'> {
  public readonly sdk: SDK.FirestoreClient = SDK.FirestoreClient;
  public readonly apiKind: ApiKind.client = ApiKind.client;
  public readonly isAdminApi = false;

  static async connect(
    config: IClientConfig | IMockConfig
  ): Promise<FirestoreClient> {
    const obj = new FirestoreClient(config);
    await obj.connect();
    return obj;
  }

  protected _auth?: IClientAuth;
  protected _app!: IClientApp;
  protected _config: IClientConfig | IMockConfig;
  protected _authProviders: FirebaseNamespace['auth'];

  public dbType: 'Firestore' = Database.Firestore;

  constructor(config?: IClientConfig | IMockConfig) {
    super();

    if (!config) {
      config = extractClientConfig();
      if (!config) {
        throw new FireError(
          `The client configuration was not set. Either set in the code or use the environment variables!`,
          `invalid-configuration`
        );
      }
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

  public async auth(): Promise<IClientAuth> {
    if (this._auth) {
      return this._auth;
    }
    if (!this.isConnected) {
      this._config.useAuth = true;
      await this.connect();
    }
    if (!this._app.auth) {
      await this.loadAuthApi();
    }
    this._auth = this._app.auth() as IClientAuth;
    return this._auth;
  }

  protected async loadFirebaseAppApi(): Promise<IClientApp> {
    return (await import('@firebase/app')) as unknown as IClientApp;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async loadAuthApi(): Promise<IClientAuth> {
    return import('@firebase/auth') as unknown as IClientAuth;
  }

  /**
   * This loads the firestore API but more importantly this makes the
   * firestore function available off the Firebase App API which provides
   * us instances of the of the Firestore API.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _loadFirestoreApi(): Promise<IClientFirestoreDatabase> {
    try {
      return import(
        '@firebase/firestore'
      ) as unknown as IClientFirestoreDatabase;
    } catch (e) {
      throw new FireError(
        `An attempt to load the "@firebase/firestore" peer dependency failed, this probably means that your application has not installed this required dependency!`,
        'missing-dependency'
      );
    }
  }

  /**
   * The steps needed to connect a database to a Firemock
   * mocked DB.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _connectMockDb(_config: IMockConfig): Promise<unknown> {
    throw new FireError(
      'The mock database is not currently available for Firestore!',
      'FirestoreClient/not-implemented'
    );
  }

  protected async _connectRealDb(config: IClientConfig): Promise<void> {
    if (!this._isConnected) {
      await this._loadFirestoreApi();
      let firebase: FirebaseNamespace & {
        firestore: (appOptions?: unknown) => IClientFirestoreDatabase;
        auth: () => IClientAuth | undefined;
      };
      if (config.useAuth) {
        this._auth = await this.loadAuthApi();
        firebase =
          (await this.loadFirebaseAppApi()) as unknown as FirebaseNamespace & {
            firestore: (appOptions?: unknown) => IClientFirestoreDatabase;
            auth: () => IClientAuth;
          };
      } else {
        firebase =
          (await this.loadFirebaseAppApi()) as unknown as FirebaseNamespace & {
            firestore: (appOptions?: unknown) => IClientFirestoreDatabase;
            auth: undefined;
          };
      }
      const runningApps = getRunningApps(firebase.apps);
      this._app = runningApps.includes(config.name)
        ? getRunningFirebaseApp<IClientApp>(config.name, firebase.apps)
        : firebase.initializeApp(config, config.name);
      this._database = firebase.firestore(this._app);
    } else {
      console.info(`Database ${config.name} already connected`);
    }
  }
}
