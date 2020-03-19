import { AdminConfig, ClientConfig } from '@forest-fire/types';
import { FirebaseApp } from '@firebase/app-types';
import { FirebaseAuth } from '@firebase/auth-types';
import { FirebaseDatabase } from '@firebase/database-types';
import { FirebaseFirestore } from '@firebase/firestore-types';
import firebase from '@firebase/app';
import { FirestoreClient } from '@forest-fire/firestore-client';

type IConfig = AdminConfig | ClientConfig;

export abstract class Database {
  static connect(config: IConfig) {
    // Right now we are assuming it's just Firestore.
    const isAdmin = isAdminConfig(config);
    if (isAdmin) {
      throw new Error('Not implemented');
    }
    return FirestoreClient.connect(config as ClientConfig);
  }
  /**
   * The Firebase app.
   */
  protected _app: FirebaseApp;
  /**
   * The authentication API of the database.
   */
  protected _auth: FirebaseAuth;
  /**
   * The database.
   */
  protected _database: FirebaseDatabase | FirebaseFirestore;
  /**
   * Returns the `_app`.
   */
  protected get app() {
    return this._app;
  }
  /**
   * Returns the `_config`.
   */
  protected get config() {
    return this._config;
  }
  /**
   * Sets the `_database`.
   */
  protected set database(value) {
    this._database = value;
  }
  /**
   * Returns the `_database`.
   */
  protected get database() {
    return this._database;
  }
  /**
   * Initializes Firebase.
   */
  protected initializeApp() {
    this._app = firebase.initializeApp(this.config);
  }
  /**
   * Creates a new instance.
   */
  protected constructor(protected _config: IConfig) {}
  /**
   * Returns the authentication API of the database.
   */
  public get auth(): FirebaseAuth {
    return this.app.auth();
  }
  /**
   * Connects to the database.
   */
  public abstract connect(): void;
}

/**
 * Returns true if `config` is the Firebase admin configuration, false
 * otherwise.
 */
const isAdminConfig = (config: IConfig): config is AdminConfig =>
  'serviceAccountId' in config;
