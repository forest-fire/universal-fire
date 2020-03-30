import { FirebaseApp } from '@firebase/app-types';
import { FirebaseAuth } from '@firebase/auth-types';
import { FirebaseDatabase } from '@firebase/database-types';
import { FirebaseFirestore } from '@firebase/firestore-types';

type IConfig = Record<string, any>;

export abstract class Database {
  static async connect<T extends Database>(
    constructor: new () => T,
    config: IConfig
  ) {
    const db = new constructor();
    db._initializeApp(config);
    db._connect();
    return db;
  }
  /**
   * The Firebase app.
   */
  protected _app: FirebaseApp | undefined;
  /**
   * The database.
   */
  protected _database: FirebaseDatabase | FirebaseFirestore | undefined;
  /**
   * Sets the `_app`.
   */
  protected set app(value) {
    this._app = value;
  }
  /**
   * Returns the `_app`.
   */
  protected get app() {
    if (this._app) {
      return this._app;
    }
    throw new Error(
      'Attempt to access Firebase App without having instantiated it'
    );
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
   * Initializes the Firebase app.
   */
  protected abstract _initializeApp(config: IConfig): void;
  /**
   * Connects to the database.
   */
  protected abstract async _connect(): Promise<this>;
  /**
   * Returns the authentication API of the database.
   */
  public get auth(): FirebaseAuth {
    if (this.app.auth) {
      return this.app.auth();
    }
    throw new Error(
      'Attempt to use auth module without having installed Firebase auth dependency'
    );
  }
}
