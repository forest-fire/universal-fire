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
import { ApiKind, IDatabaseConfig, ISdk, SDK } from '../fire-types';
import { DbTypeFrom } from './db-util';

export type IAdminSdk<T extends IDatabaseSdk<S>, S extends ISdk> = T & { isAdminApi: true };

export interface IRealTimeAdmin
  extends IDatabaseSdk<SDK.RealTimeAdmin> {
  app: IAdminApp;
  apiKind: Readonly<ApiKind.admin>;
  isAdminApi: true;
  auth: () => Promise<IAdminAuth>;
  mock: IAdminRtdbMock;
  CONNECTION_TIMEOUT: number;
}

export interface IRealTimeClient
  extends IDatabaseSdk<SDK.RealTimeClient> {
  app: IClientApp;
  apiKind: Readonly<ApiKind.client>;
  isAdminApi: false;
  auth: () => Promise<IClientAuth>;
  mock: IClientRtdbMock;
  CONNECTION_TIMEOUT: number;
}

export interface IFirestoreClient
  extends IDatabaseSdk<SDK.FirestoreClient> {
  app: IClientApp;
  apiKind: Readonly<ApiKind.client>;
  isAdminApi: false;
  auth: () => Promise<IClientAuth>;
  mock: IClientFirestoreMock;
}

export interface IFirestoreAdmin
  extends IDatabaseSdk<SDK.FirestoreAdmin> {
  app: IAdminApp;
  apiKind: ApiKind.admin;
  isAdminApi: true;
  auth: () => Promise<IAdminAuth>;
  mock: IAdminFirestoreMock;
}

/**
 * The basic contract required to be considered a "database"
 * within the **Universal Fire** universe.
 */
export interface IDatabaseSdk<
  TSdk extends ISdk,
  > {
  /**
   * The underlying database which is being connected to
   */
  dbType: Readonly<DbTypeFrom<TSdk>>;
  /** the SDK which is being used (aka, "admin", "client", ...) */
  sdk: Readonly<TSdk>;

  /**
   * Boolean flag indicating whether the underlying database connection is using
   * an Admin SDK.
   */
  isAdminApi: boolean;

  /** the Firebase App instance for this DB connection */
  app: TSdk extends SDK.FirestoreAdmin | SDK.RealTimeAdmin ? IAdminApp : IClientApp;
  /**
   * The "auth providers" such as Github, Facebook, but also EmailAndPassword, etc.
   * Each provider then exposes their own API surface to interact with.
   */
  authProviders: TSdk extends SDK.FirestoreAdmin | SDK.RealTimeAdmin ? undefined : IClientAuthProviders;
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
  mock: IMockDatabase<TSdk>;
}
