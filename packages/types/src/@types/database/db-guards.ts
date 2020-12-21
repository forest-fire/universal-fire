import { Database } from '../fire-types';
import { IDatabaseApi } from './db-api-base';
import { IFirestoreApi, IRealTimeApi } from './db-api-derivatives';
import { IAdminSdk, IDatabaseSdk } from './db-sdk';

/**
 * a _type guard_ which provides a test that the database API or SDK passed
 * is indeed a **Firebase RTDB**.
 */
export function isRealTimeDatabase(db: IDatabaseApi): db is IRealTimeApi {
  return db.dbType === Database.RTDB;
}

export function isFirestoreDatabase(db: IDatabaseApi): db is IFirestoreApi {
  return db.dbType === Database.Firestore;
}

/** The database connection was established using the Admin SDK */
export function isAdminSdk<T extends IDatabaseSdk>(db: T): db is IAdminSdk<T> {
  return db.isAdminApi;
}

/** The database connection was established using a Client SDK */
export function isClientSdk<T extends IDatabaseSdk>(db: T): db is IAdminSdk<T> {
  return !db.isAdminApi;
}
