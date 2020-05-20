import * as firebase from 'firebase-admin';
import { FirestoreDb } from '@forest-fire/firestore-db';
import {
  determineDefaultAppName,
  extractDataUrl,
  extractServiceAccount,
  FireError,
  getRunningApps,
  getRunningFirebaseApp,
} from '@forest-fire/utility';
import type {
  IMockConfig,
  isAdminConfig,
  isMockConfig,
  IAdminApp,
  IAdminAuth,
  IAdminConfig,
  IAdminSdk,
} from '@forest-fire/types';

export class FirestoreAdmin extends FirestoreDb implements IAdminSdk {
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

      const runningApps = getRunningApps(firebase.apps);
      const credential = firebase.credential.cert(config.serviceAccount);
      this._app = runningApps.includes(config.name)
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
    await this.loadFirestoreApi();
    this.database = this._app.firestore();
  }

  public async auth(): Promise<IAdminAuth> {
    return firebase.auth(this._app);
  }

  protected async loadFirestoreApi() {
    await import(/* webpackChunkName: "firebase-admin" */ 'firebase-admin');
  }
}
