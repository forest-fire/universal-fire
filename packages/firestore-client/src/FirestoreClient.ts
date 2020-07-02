import {
  FireError,
  extractClientConfig,
  getRunningApps,
  getRunningFirebaseApp,
} from '@forest-fire/utility';
import { FirestoreDb, IFirestoreDb } from '@forest-fire/firestore-db';
import {
  IAbstractedDatabase,
  IClientApp,
  IClientAuth,
  IClientConfig,
  IMockConfig,
  SDK,
  isClientConfig,
  isMockConfig,
  FirebaseNamespace,
} from '@forest-fire/types';

import type { Mock as IMockApi } from 'firemock';

export class FirestoreClient extends FirestoreDb
  implements IFirestoreDb, IAbstractedDatabase<IMockApi> {
  sdk = SDK.FirestoreClient;
  static async connect(config: IClientConfig | IMockConfig) {
    const obj = new FirestoreClient(config);
    await obj.connect();
    return obj;
  }

  protected _isAdminApi = false;
  protected _auth?: IClientAuth;
  protected _app!: IClientApp;
  protected _firestore: any;
  protected _config: IClientConfig | IMockConfig;
  protected _authProviders: FirebaseNamespace['auth'];

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

  public async connect(): Promise<FirestoreClient> {
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
    this._auth = this._app.auth!() as IClientAuth;
    return this._auth;
  }

  protected async loadFirebaseApi() {
    return await import('@firebase/app');
  }

  protected async loadAuthApi() {
    return import('@firebase/auth');
  }

  protected async loadFirestoreApi() {
    return import('@firebase/firestore');
  }

  /**
   * The steps needed to connect a database to a Firemock
   * mocked DB.
   */
  protected async _connectMockDb(config: IMockConfig) {
    await this.getFireMock({
      db: config.mockData || {},
      auth: { providers: [], ...config.mockAuth },
    });
    this._authProviders = this._mock.authProviders;
  }

  protected async _connectRealDb(config: IClientConfig) {
    if (!this._isConnected) {
      await this.loadFirestoreApi();
      if (config.useAuth) {
        // await this.loadAuthApi();
        this._auth = this._app.auth();
      }
      const firebase = ((await this.loadFirebaseApi()) as unknown) as FirebaseNamespace & {
        firestore: any;
      };
      const runningApps = getRunningApps(firebase.apps);
      this._app = runningApps.includes(config.name)
        ? (getRunningFirebaseApp<IClientApp>(
            config.name,
            firebase.apps
          ) as IClientApp)
        : firebase.initializeApp(config, config.name);
      this._database = firebase.firestore(this._app);
    } else {
      console.info(`Database ${config.name} already connected`);
    }
  }
}
