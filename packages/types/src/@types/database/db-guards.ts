import { isNonNullObject } from 'common-types';
import { IFirestoreDatabase, IRtdbDatabase } from '../fire-proxies';
import { Database, IDb, ISdk } from '../fire-types';
import { IDatabaseApi } from './db-api-base';
import { IDatabaseSdk } from './db-sdk';


export function isDatabase(db: unknown): db is IDatabaseApi<IDb> {
  return isNonNullObject(db) && (db as IDatabaseApi<IDb>).dbType !== undefined;
}

export function isSdk(sdk: unknown): sdk is IDatabaseSdk<ISdk, IDb> {
  return isNonNullObject(sdk) && isDatabase(sdk) && (sdk as IDatabaseSdk<ISdk, IDb>).isAdminApi !== undefined;
}

/**
 * a _type guard_ which provides a test that the database API or SDK passed
 * is indeed a **Firebase RTDB**.
 */
export function isRealTimeDatabase(db: unknown): db is IDatabaseApi<"RTDB", IRtdbDatabase> {
  return isDatabase(db) && db.dbType === Database.RTDB;
}

export function isFirestoreDatabase(db: unknown): db is IDatabaseApi<"Firestore", IFirestoreDatabase> {
  return isDatabase(db) && db.dbType === Database.Firestore;
}

/** The database connection was established using the Admin SDK */
export function isAdminSdk(sdk: unknown): sdk is IDatabaseSdk<"FirestoreAdmin" | "RealTimeAdmin", IDb> {
  return isSdk(sdk) && sdk.isAdminApi;
}

/** The database connection was established using a Client SDK */
export function isClientSdk(sdk: unknown): sdk is IDatabaseSdk<"FirestoreClient" | "RealTimeClient", IDb> {
  return isSdk(sdk) && !sdk.isAdminApi;
}
