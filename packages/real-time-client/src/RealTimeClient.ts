import { EventManager } from './EventManager';
import { ClientError } from './ClientError';
import { FirebaseNamespace, FirebaseApp } from '@firebase/app-types';
import {
  RealTimeDb,
  IFirebaseClientConfig,
  isMockConfig,
  IFirebaseClientConfigProps
} from '@forest-fire/real-time-db';
import { IClientConfig } from '@forest-fire/types';
import { IFirebaseConfig } from 'abstracted-firebase/dist/esnext/types';

export enum FirebaseBoolean {
  true = 1,
  false = 0
}

export let MOCK_LOADING_TIMEOUT = 200;

export type FirebaseDatabase = import('@firebase/database-types').FirebaseDatabase;
export type FirebaseAuth = import('@firebase/auth-types').FirebaseAuth;

export { IFirebaseClientConfig } from 'abstracted-firebase';

export class RealTimeClient extends RealTimeDb {
  /**
   * Instantiates a DB and then waits for the connection
   * to finish.
   */
  protected async _connect(): Promise<RealTimeClient> {
    const obj = new RealTimeClient(this.config);
    await obj.waitForConnection();

    return obj;
  }

  public readonly config: IFirebaseClientConfig;

  /** lists the database names which are currently connected */
  public static async connectedTo() {
    // tslint:disable-next-line:no-submodule-imports
    const fb = await import('@firebase/app');
    await import('@firebase/database');
    return Array.from(new Set(fb.firebase.apps.map(i => i.name)));
  }

  protected _eventManager: EventManager;
  protected _database: FirebaseDatabase;
  protected _auth: FirebaseAuth;
  protected _config: IFirebaseClientConfig;

  protected _fbClass:
    | FirebaseNamespace
    | (FirebaseNamespace & { auth: () => FirebaseNamespace['auth'] });
  protected _authProviders: FirebaseNamespace['auth'];
  protected app: FirebaseApp;

  constructor(config: IFirebaseClientConfig) {
    super(config);
    this._config = config;
    this._eventManager = new EventManager();
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

  public async auth(): Promise<FirebaseAuth> {
    if (this._auth) {
      return this._auth;
    }
    if (!this.isConnected) {
      await this.waitForConnection();
    }
    if (this._mocking) {
      this._auth = await this.mock.auth();
      return this._auth;
    }
    this._auth = this.app.auth() as FirebaseAuth;
    return this._auth;
  }

  /**
   * connect
   *
   * Asynchronously loads the firebase/app library and then
   * initializes a connection to the database.
   */
  protected async connectToFirebase(
    config: IFirebaseClientConfig,
    useAuth: boolean = true
  ) {
    if (isMockConfig(config)) {
      // MOCK DB
      await this.getFireMock({
        db: config.mockData || {},
        auth: { providers: [], ...config.mockAuth }
      });
      this._authProviders = this._mock
        .authProviders as FirebaseNamespace['auth'];
      this._isConnected = true;
    } else {
      // REAL DB
      if (!this._isConnected) {
        if (process.env['FIREBASE_CONFIG']) {
          config = { ...config, ...JSON.parse(process.env['FIREBASE_CONFIG']) };
        }
        config = config as IFirebaseClientConfigProps;
        if (!config.apiKey || !config.authDomain || !config.databaseURL) {
          throw new Error(
            'Trying to connect without appropriate firebase configuration!'
          );
        }
        config.name =
          config.name ||
          config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1');

        // tslint:disable-next-line:no-submodule-imports
        const fb = await import(
          /* webpackChunkName: "firebase-app" */ '@firebase/app'
        );
        await import(
          /* webpackChunkName: "firebase-db" */ '@firebase/database'
        );
        if (useAuth) {
          await import(
            /* webpackChunkName: "firebase-auth" */ '@firebase/auth'
          );
        }
        try {
          const runningApps = new Set(fb.firebase.apps.map(i => i.name));
          this.app = runningApps.has(config.name)
            ? // TODO: does this connect to the right named DB?
              fb.firebase.app(config.name)
            : fb.firebase.initializeApp(config, config.name);
        } catch (e) {
          if (e.message && e.message.indexOf('app/duplicate-app') !== -1) {
            console.log(`The "${name}" app already exists; will proceed.`);
            this._isConnected = true;
          } else {
            throw e;
          }
        }
        this._fbClass = fb.default;
        this._database = this.app.database();
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
