import { DbConfigFrom, IDatabaseSdk, ISdk } from '@forest-fire/types';

/**
 * Provides a simple factory API surface:
 * 
 * - `create` - synchronously creates a SDK instance w/o connecting
 * - `connect` - asynchronously creates a SDK instance and then waits for connection
 */
export interface ISdkFactory<TSdk extends ISdk> {
  /** return a new instance of the `universal-fire` SDK */
  create: (config: DbConfigFrom<TSdk>) => IDatabaseSdk<TSdk>;
  /** return a new instance of the `universal-fire` SDK after connecting it to the database */
  connect: (config: DbConfigFrom<TSdk>) => Promise<IDatabaseSdk<TSdk>>;
}
