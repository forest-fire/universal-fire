import type { IDatabaseSdk } from 'universal-fire';

import { FireModelPluginError } from "~/errors";
import { ClientSdk } from '@forest-fire/types';

let _db: IDatabaseSdk;
/**
 * provides access to the database that was passed in by the consuming application
 */
export function getDatabase<T extends IDatabaseSdk<ClientSdk>>(): T {
  if (!_db) {
    throw new FireModelPluginError(`A call to database() failed because the database was not set!`);
  }
  return _db as T;
}

export function storeDatabase(db: IDatabaseSdk) {
  _db = db
}