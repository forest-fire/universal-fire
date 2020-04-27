// TODO: reduce this to just named symbols which we need!
import * as firebase from 'firebase-admin';
import * as process from 'process';
import {
  RealTimeDb,
  IRealTimeDb,
  _getFirebaseType
} from '@forest-fire/real-time-db';
import { EventManager } from './EventManager';
import { debug } from './util';
import {
  IAdminConfig,
  IMockConfig,
  isMockConfig,
  isAdminConfig,
  IAdminConfigCompleted,
  IAdminAuth
} from '@forest-fire/types';
import {
  extractServiceAccount,
  FireError,
  runningApps,
  extractDataUrl
} from '@forest-fire/utility';
import { RealTimeAdminError } from './errors/RealTimeAdminError';

export interface IFirebaseListener {
  id: string;
  cb: (db: RealTimeAdmin) => void;
}

export class RealTimeAdmin extends RealTimeDb implements IRealTimeDb {
  protected _isAdminApi = true;
  /**
   * Instantiates a DB and then waits for the connection
   * to finish before resolving the promise.
   */
  public static async connect(config: IAdminConfig | IMockConfig = {}) {
    const obj = new RealTimeAdmin(config);
    await obj.connect();
    return obj;
  }

  protected _eventManager: EventManager;
  protected _clientType = 'admin';
  protected _isAuthorized: boolean = true;
  protected _auth?: IAdminAuth;
  protected _config!: IAdminConfigCompleted | IMockConfig;
  protected _app: any;

  constructor(config: IAdminConfig | IMockConfig = {}) {
    super();
    this._eventManager = new EventManager();
    this._mocking = config.mocking ? true : false;
    if (config.timeout) {
      this.CONNECTION_TIMEOUT = config.timeout || 5000;
    }

    if (isAdminConfig(config)) {
      config.serviceAccount = extractServiceAccount(config);
      config.databaseUrl = extractDataUrl(config);
      this._config = config as IAdminConfigCompleted;
    } else if (isMockConfig(config)) {
      this._mocking = true;
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

    this.listenForConnectionStatus();
  }

  /**
   * Provides access to the Firebase Admin Auth API.
   *
   * > If using a _mocked_ database then the Auth API will be redirected to **firemock**
   * instead of the real Admin SDK for Auth. Be aware that this mocked API may not be fully implemented
   * but PR's are welcome if the part you need is not yet implemented. If you want to explicitly state
   * whether to use the _real_ or _mock_ Auth SDK then you can state this by passing in a `auth` parameter
   * as part of the configuration (using either "real" or "mocked" as a value)
   *
   * References:
   * - [Introduction](https://firebase.google.com/docs/auth/admin)
   * - [API](https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth)
   */
  public async auth(): Promise<IAdminAuth> {
    return firebase.auth();
  }

  public goOnline() {
    if (this._database) {
      try {
        this._database.goOnline();
      } catch (e) {
        debug('There was an error going online:' + e);
      }
    } else {
      console.warn(
        'Attempt to use goOnline() prior to having a database connection!'
      );
    }
  }

  public goOffline() {
    if (this._database) {
      this._database.goOffline();
    } else {
      console.warn(
        'Attempt to use goOffline() prior to having a database connection!'
      );
    }
  }

  public async connect(): Promise<RealTimeAdmin> {
    if (isMockConfig(this._config)) {
      // MOCK DB
      // TODO: where are we attaching the mock API; seems like somethings missing
      await this.getFireMock({
        db: this._config.mockData || {},
        auth: { providers: [], ...this._config.mockAuth }
      });
      this._isConnected = true;
      return this;
    } else {
      if (this._isConnected && this._app) {
        this.goOnline();
        new EventManager().connection(true);
        return this;
      }

      if (this._isAuthorized) {
        console.log(`already authorized`);
        return this;
      }

      if (isAdminConfig(this._config)) {
        console.log(
          `Connecting to Firebase: [${process.env['FIREBASE_DATABASE_URL']}]`
        );

        try {
          const name = this._config.name || '[DEFAULT]';
          const apps = runningApps(firebase.apps);
          const serviceAccount = this._config.serviceAccount;
          const databaseURL = this._config.databaseUrl;
          debug(
            `abstracted-admin: the DB "${name}" ` + apps.includes(name)
              ? 'appears to be already connected'
              : 'has not yet been connected'
          );

          this._app = apps.includes(name)
            ? firebase.app()
            : firebase.initializeApp({
                credential: firebase.credential.cert(serviceAccount),
                databaseURL
              });
          this._isAuthorized = true;
          this._database = firebase.database() as any;
          this.enableDatabaseLogging = firebase.database.enableLogging.bind(
            firebase.database
          );
          this._app = firebase;
          this.goOnline();
          new EventManager().connection(true);
        } catch (err) {
          if (
            err.message.indexOf('The default Firebase app already exists.') !==
            -1
          ) {
            console.warn(
              'DB was already logged in, however flag had not been set!'
            );
            this._isConnected = true;
          } else {
            this._isConnected = false;
            console.warn('Problem connecting to Firebase', err);
            throw new Error(err);
          }
        }
      } else {
        throw new RealTimeAdminError(
          'The configuation passed is not valid for an admin SDK!',
          'invalid-configuration'
        );
      }
    }

    if (this._config.debugging) {
      this.enableDatabaseLogging(
        typeof this._config.debugging === 'function'
          ? (message: string) => (this._config.debugging as any)(message)
          : (message: string) => console.log('[FIREBASE]', message)
      );
    }

    return this;
  }

  /**
   * listenForConnectionStatus
   *
   * in the admin interface we assume that ONCE connected
   * we remain connected; this is unlike the client API
   * which provides an endpoint to lookup
   */
  protected listenForConnectionStatus() {
    this._isConnected = true;
    this._eventManager.connection(true);
  }
}
