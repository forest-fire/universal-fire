/* eslint-disable @typescript-eslint/ban-types */
import { IMockDatabase } from '../db-mocking';

import { IDatabaseConfig, ISdk } from '../fire-types';
import { IDatabaseApi } from './IDatabaseApi';
import { AppFrom, AuthFrom, AuthProviders, DbTypeFrom, IsAdminSdk } from './db-util';


/**
 * The basic contract required to be considered a "database"
 * within the **Universal Fire** universe.
 */
export type IDatabaseSdk<TSdk extends ISdk = ISdk> = IDatabaseApi<TSdk> & {
  /** the SDK which is being used (aka, "admin", "client", ...) */
  sdk: Readonly<TSdk>;

  /**
   * The underlying database which is being connected to
   */
  dbType: Readonly<DbTypeFrom<TSdk>>;

  /**
   * Boolean flag indicating whether the underlying database connection is using
   * an Admin SDK.
   */
  isAdminApi: Readonly<IsAdminSdk<TSdk>>;

  /** the Firebase App instance for this DB connection */
  app: AppFrom<TSdk>;
  /**
   * The "auth providers" such as Github, Facebook, but also EmailAndPassword, etc.
   * Each provider then exposes their own API surface to interact with.
   */
  authProviders: AuthProviders<TSdk>;
  /**
   * Connect to the database
   */
  connect: () => Promise<unknown>;
  /**
   * Get access to the Firebase Auth API
   */
  auth: () => Promise<AuthFrom<TSdk>>;

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
  /**
 * How long should try to connect before timing out.
 * 
 * Note: this is only implemented in Real Time database
 */
  CONNECTION_TIMEOUT: number;
}