import { isNonNullObject } from 'common-types';
import { IFirestoreDatabase, IRtdbDatabase } from '../fire-proxies';
import { Database, IFirestoreSdk, IRtdbSdk, ISdk } from '../fire-types';
import { IDatabaseSdk } from './db-sdk';

export function isDatabase(db: unknown): db is IDatabaseSdk<ISdk> {
  return isNonNullObject(db) && (db as IDatabaseSdk<ISdk>).dbType !== undefined;
}

export function isSdk(sdk: unknown): sdk is IDatabaseSdk<ISdk> {
  return (
    isNonNullObject(sdk) && isDatabase(sdk) && sdk.isAdminApi !== undefined
  );
}

/**
 * a _type guard_ which provides a test that the database API or SDK passed
 * is indeed a **Firebase RTDB**.
 */
export function isRealTimeDatabase(db: unknown): db is IDatabaseSdk<IRtdbSdk> {
  return isDatabase(db) && db.dbType === Database.RTDB;
}

export function isFirestoreDatabase(
  db: unknown
): db is IDatabaseSdk<IFirestoreSdk> {
  return isDatabase(db) && db.dbType === Database.Firestore;
}

/** The database connection was established using the Admin SDK */
export function isAdminSdk(
  sdk: unknown
): sdk is IDatabaseSdk<'FirestoreAdmin' | 'RealTimeAdmin'> {
  return isSdk(sdk) && sdk.isAdminApi;
}

/** The database connection was established using a Client SDK */
export function isClientSdk(
  sdk: unknown
): sdk is IDatabaseSdk<'FirestoreClient' | 'RealTimeClient'> {
  return isSdk(sdk) && !sdk.isAdminApi;
}
