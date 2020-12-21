import {
  IAbstractedEvent,
  IAdminAuth,
  IClientAuth,
  IClientAuthProviders,
  IDatabaseConfig,
  ISerializedQuery,
  SDK,
  IAdminApp,
  IClientApp,
  ApiKind,
  Database,
  IMockDatabase,
} from '../index';
import {
  IAdminFirestoreMock,
  IAdminRtdbMock,
  IClientFirestoreMock,
  IClientRtdbMock,
} from './db-mocking';

/**
 * The basic contract required to be considered a "database"
 * within the **Universal Fire** universe.
 */
export interface IDatabaseSdk extends IDatabase {
  /** the Firebase SDK which is being used as an abstracted database */
  sdk: SDK;
  /**
   * The underlying database which is being connected to
   */
  dbType: Database;
  /**
   * Boolean flag indicating whether the underlying database connection is using
   * an Admin SDK.
   */
  isAdminApi: boolean;

  /** the Firebase App instance for this DB connection */
  app: IClientApp | IAdminApp;
  /**
   * The "auth providers" such as Github, Facebook, but also EmailAndPassword, etc.
   * Each provider then exposes their own API surface to interact with.
   */
  authProviders: IClientAuthProviders;
  /**
   * Connect to the database
   */
  connect: () => Promise<unknown>;
  /**
   * Get access to the Firebase Auth API
   */
  auth: () => Promise<IClientAuth | IAdminAuth>;

  /**
   * Returns true if the database is connected, false otherwise.
   */
  isConnected: boolean;

  /**
   * The configuration used to setup/configure the database.
   */
  config: Readonly<IDatabaseConfig>;

  /**
   * A boolean flag indicating whether the underlying database is a _mock_ database.
   */
  isMockDb: boolean;
  /**
   * The administrative interface for unknown package which will provide a _mocked_
   * database.
   */
  mock: IMockDatabase;
}

/**
 * The commands which `universal-fire` exposes to interact with the database
 * regardless of the SDK client.
 *
 * > This also provides the core API which a DB _mock_ in **Firemock** will need
 * > to expose while intereacting with the DB's native language to provide the
 * > functionality
 */
export interface IDatabase {
  /**
   * Get a database _reference_ to the underlying database at a given path
   */
  ref: (path?: string) => unknown;

  /**
   * Get a _list_ of records at a given path in the database. The return representation will be
   * an array of dictionaries where the _key_ for the record will be assigned the property value
   * of `id` (unless overriden by the `idProp` param)
   */
  getList: <T = unknown>(
    path: string | ISerializedQuery<T>,
    idProp?: string
  ) => Promise<T[]>;
  /**
   * Gets a push-key from the server at a given path. This ensures that
   * multiple client's who are writing to the database will use the server's
   * time rather than their own local time.
   *
   * @param path the path in the database where the push-key will be pushed to
   */
  getPushKey: (path: string) => Promise<string>;
  /**
   * Gets a record from a given path in the Firebase DB and converts it to an
   * object where the record's key is included as part of the record.
   */
  getRecord: <T = unknown>(path: string, idProp?: string) => Promise<T>;
  /**
   * Returns the value at a given path in the database. This method is a
   * typescript _generic_ which defaults to `unknown` but you can set the type to
   * whatever value you expect at that path in the database.
   */
  getValue: <T = unknown>(path: string) => Promise<T | void>;
  /**
   * Updates the database at a given path.
   *
   * Note:  this operation is **non-destructive**, so assuming that the value you
   * are passing in a POJO/object then the properties sent in will be updated but if
   * properties that exist in the DB, but not in the value passed in then these properties
   * will _not_ be changed.
   */
  update: <T = unknown>(path: string, value: Partial<T>) => Promise<void>;
  /**
   * Sets a value in the database at a given path.
   */
  set: <T = unknown>(path: string, value: T) => Promise<void>;
  /**
   * Removes a path from the database.
   */
  remove: (path: string, ignoreMissing?: boolean) => Promise<unknown>;
  /**
   * Watch for Firebase events based on a DB path.
   */
  watch: (
    target: string | ISerializedQuery,
    events: IAbstractedEvent | IAbstractedEvent[],
    cb: unknown
  ) => void;
  /**
   * Unwatches existing Firebase events.
   */
  unWatch: (
    events?: IAbstractedEvent | IAbstractedEvent[],
    cb?: unknown
  ) => void;
}

export interface IRealTimeAdmin extends IDatabaseSdk {
  app: IAdminApp;
  sdk: Readonly<SDK.RealTimeAdmin>;
  dbType: Readonly<Database.RTDB>;
  apiKind: Readonly<ApiKind.admin>;
  isAdminApi: true;
  auth: () => Promise<IAdminAuth>;
  mock: IAdminRtdbMock;
  CONNECTION_TIMEOUT: number;
}

export interface IRealTimeClient extends IDatabaseSdk {
  app: IClientApp;
  sdk: Readonly<SDK.RealTimeClient>;
  dbType: Readonly<Database.RTDB>;
  apiKind: Readonly<ApiKind.client>;
  isAdminApi: false;
  auth: () => Promise<IClientAuth>;
  mock: IClientRtdbMock;
  CONNECTION_TIMEOUT: number;
}

export interface IFirestoreClient extends IDatabaseSdk {
  app: IClientApp;
  sdk: Readonly<SDK.FirestoreClient>;
  dbType: Readonly<Database.Firestore>;
  apiKind: Readonly<ApiKind.client>;
  isAdminApi: false;
  auth: () => Promise<IClientAuth>;
  mock: IClientFirestoreMock;
}

export interface IFirestoreAdmin extends IDatabaseSdk {
  app: IAdminApp;
  sdk: SDK.FirestoreAdmin;
  dbType: Database.Firestore;
  apiKind: ApiKind.admin;
  isAdminApi: true;
  auth: () => Promise<IAdminAuth>;
  mock: IAdminFirestoreMock;
}

export type IAbstractedDatabase =
  | IRealTimeAdmin
  | IRealTimeClient
  | IFirestoreAdmin
  | IFirestoreClient;

/** The database being used is the **Firestore** database */
export function isFirestoreBacked(
  db: IAbstractedDatabase
): db is IFirestoreAdmin | IFirestoreClient {
  return db.dbType === Database.Firestore;
}

/** The database being used is the Real Time Database (RTDB) */
export function isRtdbBacked(
  db: IAbstractedDatabase
): db is IRealTimeAdmin | IRealTimeClient {
  return db.dbType === Database.RTDB;
}

/** The database connection was established using the Admin SDK */
export function isAdminSdk(db: IAbstractedDatabase): boolean {
  return db.apiKind === ApiKind.admin;
}

/** The database connection was established using the Admin SDK */
export function isClientSdk(db: IAbstractedDatabase): boolean {
  return db.apiKind === ApiKind.client;
}

/** The database connection was established using the Admin SDK */
// export function isRestSdk(db: IAbstractedDatabase) {
//   return db.apiKind === ApiKind.rest;
// }
