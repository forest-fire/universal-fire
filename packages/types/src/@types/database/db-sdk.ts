import { IDatabase } from '../database/index';
import {
  IAdminFirestoreMock,
  IAdminRtdbMock,
  IClientFirestoreMock,
  IClientRtdbMock,
  IMockDatabase,
} from '../db-mocking';
import {
  IAdminApp,
  IAdminAuth,
  IClientApp,
  IClientAuth,
  IClientAuthProviders,
} from '../fire-proxies';
import { ApiKind, Database, IDatabaseConfig, SDK } from '../fire-types';

export type IAdminSdk<T extends IDatabaseSdk> = T & { isAdminApi: true };
export type IClientSdk<T extends IDatabaseSdk> = T & { isAdminApi: false };

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

/**
 * The basic contract required to be considered a "database"
 * within the **Universal Fire** universe.
 */
export interface IDatabaseSdk extends IDatabase {
  /** the SDK which is being used (aka, "admin", "client", ...) */
  sdk: SDK;

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
