import {
  FireError,
  determineDefaultAppName,
  extractDataUrl,
  extractServiceAccount,
  getRunningApps,
  getRunningFirebaseApp,
} from '@forest-fire/utility';
import {
  IAdminApp,
  IAdminAuth,
  IAdminConfig,
  IMockConfig,
  SDK,
  isAdminConfig,
  isMockConfig,
  IAdminFirebaseNamespace,
  IAdminFirestoreDatabase,
  ApiKind,
  Database,
} from '@forest-fire/types';

import { FirestoreDb } from '@forest-fire/firestore-db';

export class FirestoreAdmin extends FirestoreDb<"FirestoreAdmin">  {
  public readonly sdk: SDK.FirestoreAdmin = SDK.FirestoreAdmin;
  public readonly apiKind: ApiKind.admin = ApiKind.admin;
  public readonly isAdminApi = true;
  public dbType: "Firestore" = Database.Firestore;

  static async connect(config: IAdminConfig | IMockConfig): Promise<FirestoreAdmin> {
    const obj = new FirestoreAdmin(config);
    await obj.connect();
    return obj;
  }

  protected _auth?: IAdminAuth;
  protected _firestore?: IAdminFirestoreDatabase;
  protected _admin?: IAdminFirebaseNamespace;
  declare protected _app: IAdminApp;
  declare protected _config: IAdminConfig | IMockConfig;

  constructor(config?: IAdminConfig | IMockConfig) {
    super();
    if (isMockConfig(config)) {
      throw new FireError(
        `Mock is not supported by Firestore`,
        `invalid-configuration`
      );
    }
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
    this._config = config;
  }

  /**
   * Connects the database by async loading the npm dependencies
   * for the Admin API. This is all that is needed to be considered
   * "connected" in an Admin SDK.
   */
  public async connect(): Promise<void> {
    if (this._isConnected) {
      console.info(
        `Firestore already connected to app name "${this.config.name}"`
      );
    }
    if (isAdminConfig(this._config)) {
      await this._connectRealDb(this._config);
    } else if (isMockConfig(this._config)) {
      await this._connectMockDb(this._config);
    } else {
      console.warn(
        `Call to connect() being ignored as the configuration was not recognized as a valid admin or mock config. The config was: ${JSON.stringify(
          this._config,
          null,
          2
        )}`
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async auth(): Promise<IAdminAuth> {
    if (this._config.mocking) {
      throw new FireError(
        `The auth API for MOCK databases is not yet implemented for Firestore`
      );
    }
    if (this._admin) {
      throw new FireError(
        `Attempt to call Auth API initializer before setting up the firebase namespace!`,
        'not-allowed'
      );
    }

    return this._admin.auth(this._app);
  }

  protected async _loadAdminApi(): Promise<IAdminFirebaseNamespace> {
    const api = ((await import(
      'firebase-admin'
    )) as unknown) as IAdminFirebaseNamespace;
    return api;
  }

  protected async _connectRealDb(config: IAdminConfig): Promise<void> {
    if (!this._admin) {
      this._admin = ((await import(
        'firebase-admin'
      )) as unknown) as IAdminFirebaseNamespace;
    }

    if (!config.serviceAccount) {
      throw new FireError(
        `There was no service account found in the configuration!`
      );
    }

    const runningApps = getRunningApps(this._admin.apps);
    const credential = this._admin.credential.cert(config.serviceAccount);

    if (!this._isConnected) {
      this._app = runningApps.includes(config.name)
        ? getRunningFirebaseApp<IAdminApp>(
          config.name,
          (this._admin.apps as unknown) as IAdminApp[]
        )
        : this._admin.initializeApp(
          {
            credential,
            databaseURL: config.databaseURL,
          },
          config.name
        );

      // this._firestore = this._admin.firestore(this._app);
    }
  }
  /**
   * The steps needed to connect a database to a Firemock
   * mocked DB.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _connectMockDb(_config: IMockConfig): Promise<void> {
    throw new FireError("Firemock is not implemented for Firestore yet!", "FirestoreAdmin/not-implemented");
  }
}
