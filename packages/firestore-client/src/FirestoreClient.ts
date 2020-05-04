import { firebase } from '@firebase/app';
import { FirestoreDb } from '@forest-fire/firestore-db';
import {
  IMockConfig,
  IClientSdk,
  isClientConfig,
  IClientConfig,
  isMockConfig,
  IClientApp,
  IFirestoreDatabase
} from '@forest-fire/types';
import { extractClientConfig, FireError } from '@forest-fire/utility';

export class FirestoreClient extends FirestoreDb implements IClientSdk {
  static async connect(config: IClientConfig | IMockConfig) {
    const obj = new FirestoreClient(config);
    await obj.connect();
    return obj;
  }
  protected _app: IClientApp | undefined;
  protected _config: IClientConfig | IMockConfig;
  protected _isAdminApi = false;

  constructor(config: IClientConfig | IMockConfig) {
    super();
    if (!config) {
      extractClientConfig();
    }
    if (isClientConfig(config)) {
      this._app = firebase.initializeApp(config);
    } else if (isMockConfig(config)) {
      //
    } else {
      throw new FireError(
        `The configuration passed to FirestoreClient was invalid!`,
        `invalid-configuration`
      );
    }

    this._config = config;
  }

  public async connect(): Promise<FirestoreClient> {
    if (isClientConfig(this._config)) {
      await import(
        /* webpackChunkName: 'firebase-firestore' */ '@firebase/firestore'
      );

      this._database = this._app!.firestore!();
      // TODO: implement a way to validate when connection is established
    }

    return this;
  }

  public async auth() {
    await import(/* webpackChunkName: 'firebase-auth' */ '@firebase/auth');
    if (this._app?.auth) {
      return this._app.auth();
    }
    throw new Error(
      'Attempt to use auth module without having installed Firebase auth dependency'
    );
  }
}
