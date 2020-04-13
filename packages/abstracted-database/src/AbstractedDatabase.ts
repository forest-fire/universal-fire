import {
  DocumentChangeType as IFirestoreDbEvent,
  FirebaseFirestore
} from '@firebase/firestore-types';
import {
  EventType as IRealTimeDbEvent,
  FirebaseDatabase
} from '@firebase/database-types';
import { FirebaseApp } from '@firebase/app-types';
import { FirebaseAuth } from '@firebase/auth-types';
import { ISerializedQuery } from '@forest-fire/types';
import type { Mock as MockDb } from 'firemock';

type IConfig = Record<string, any>;

export abstract class AbstractedDatabase {
  static async connect<T extends AbstractedDatabase>(
    constructor: new () => T,
    config: IConfig
  ) {
    const db = new constructor();
    db._initializeApp(config);
    db._connect();
    return db;
  }
  /**
   * Indicates if the database is using the admin SDK.
   */
  protected _isAdminApi: boolean = false;
  /**
   * Indicates if the database is a mock database.
   */
  protected _isMock: boolean = false;
  /**
   * The Firebase app.
   */
  protected _app: FirebaseApp | undefined;
  /**
   * The database.
   */
  protected _database: FirebaseDatabase | FirebaseFirestore | undefined;
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
   * Sets the `_app`.
   */
  protected set app(value) {
    this._app = value;
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
  public abstract async auth(): Promise<FirebaseAuth>;
  /**
   * Indicates if the database is using the admin SDK.
   */
  public get isAdminApi() {
    return this._isAdminApi;
  }
  /**
   * Indicates if the database is a mock database.
   */
  public get isMockDb() {
    return this._isMock;
  }
  /**
   * Returns a mocked database.
   */
  public abstract get mock(): MockDb | void;
  /**
   * Get a list of a given type (defaults to _any_). Assumes that the "key" for
   * the record is the `id` property but that can be changed with the optional
   * `idProp` parameter.
   */
  public abstract async getList<T = any>(
    path: string | ISerializedQuery,
    idProp?: string
  ): Promise<T[]>;
  /**
   * Get's a push-key from the server at a given path. This ensures that
   * multiple client's who are writing to the database will use the server's
   * time rather than their own local time.
   *
   * @param path the path in the database where the push-key will be pushed to
   */
  public abstract async getPushKey(path: string): Promise<string>;
  /**
   * Gets a record from a given path in the Firebase DB and converts it to an
   * object where the record's key is included as part of the record.
   */
  public abstract async getRecord<T = any>(
    path: string,
    idProp?: string
  ): Promise<T>;
  /**
   * Returns the value at a given path in the database. This method is a
   * typescript _generic_ which defaults to `any` but you can set the type to
   * whatever value you expect at that path in the database.
   */
  public abstract async getValue<T = any>(path: string): Promise<T | void>;
  /**
   * Add a value in the database at a given path.
   */
  public abstract async add<T = any>(path: string, value: T): Promise<void>;
  /**
   * Updates the database at a given path. Note that this operation is
   * **non-destructive**, so assuming that the value you are passing in a
   * POJO/object then the properties sent in will be updated but if properties
   * that exist in the DB, but not in the value passed in then these properties
   * will _not_ be changed.
   */
  public abstract async update<T = any>(
    path: string,
    value: Partial<T>
  ): Promise<void>;
  /**
   * Sets a value in the database at a given path.
   */
  public abstract async set<T = any>(path: string, value: T): Promise<void>;
  /**
   * Removes a path from the database.
   */
  public abstract async remove(path: string): Promise<void>;
  /**
   * Watch for Firebase events based on a DB path.
   */
  public abstract watch(
    target: string | ISerializedQuery,
    events: IFirestoreDbEvent[] | IRealTimeDbEvent[],
    cb: any
  ): void;
  /**
   * Unwatches existing Firebase events.
   */
  public abstract unWatch(
    events?: IFirestoreDbEvent[] | IRealTimeDbEvent[],
    cb?: any
  ): void;
  /**
   * Returns a reference for a given path in Firebase
   */
  public abstract ref(path?: string): any;
}
