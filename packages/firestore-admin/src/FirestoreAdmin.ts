import {
  app,
  apps,
  credential as fbCredential,
  initializeApp,
  auth,
  firestore,
} from 'firebase-admin';

import {
  FireError,
  determineDefaultAppName,
  extractDataUrl,
  extractServiceAccount,
  getRunningApps,
  getRunningFirebaseApp,
} from '@forest-fire/utility';
import {
  IAbstractedDatabase,
  IAdminApp,
  IAdminAuth,
  IAdminConfig,
  IAdminSdk,
  IMockConfig,
  SDK,
  isAdminConfig,
  isMockConfig,
} from '@forest-fire/types';

import { FirestoreDb } from '@forest-fire/firestore-db';
import type { Mock as IMockApi } from 'firemock';

export class FirestoreAdmin extends FirestoreDb
  implements IAdminSdk, IAbstractedDatabase<IMockApi> {
  sdk = SDK.FirestoreAdmin;
  static async connect(config: IAdminConfig | IMockConfig) {
    const obj = new FirestoreAdmin(config);
    await obj.connect();
    return obj;
  }

  protected _isAdminApi = true;
  protected _auth?: IAdminAuth;
  protected _app!: IAdminApp;
  protected _config: IAdminConfig | IMockConfig;

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

  public async connect(): Promise<FirestoreAdmin> {
    if (this._isConnected) {
      console.info(`Firestore ${this.config.name} already connected`);
      return this;
    }
    if (isAdminConfig(this._config)) {
      await this._connectRealDb(this._config);
    } else if (isMockConfig(this._config)) {
      await this._connectMockDb(this._config);
    }
  }

  public async auth(): Promise<IAdminAuth> {
    if (this._config.mocking) {
      throw new FireError(
        `The auth API for MOCK databases is not yet implemented for Firestore`
      );
    }

    return auth(this._app as app.App);
  }

  protected async _connectRealDb(config: IAdminConfig) {
    if (!config?.serviceAccount) {
      throw new FireError(
        `There was no service account found in the configuration!`
      );
    }
    const runningApps = getRunningApps(apps);
    const credential = fbCredential.cert(config.serviceAccount);

    if (!this._isConnected) {
      this._app = runningApps.includes(config.name)
        ? getRunningFirebaseApp<IAdminApp>(
            config.name,
            (apps as unknown) as IAdminApp[]
          )
        : initializeApp(
            {
              credential,
              databaseURL: config.databaseURL,
            },
            config.name
          );
    }
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
  }
}
