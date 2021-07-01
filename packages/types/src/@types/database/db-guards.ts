import { IDictionary, isNonNullObject } from 'common-types';
import { AdminSdk, ClientSdk, Database, IFirestoreSdk, IRtdbSdk, ISdk } from '../fire-types';
import { IDatabaseSdk } from './db-sdk';

/**
 * Type guard to validate that the passed in variable is in fact
 * a database which implements `IDatabaseSdk`.
 */
export function isDatabase<T extends IDatabaseSdk<ISdk>>(db: unknown): db is T {
  return isNonNullObject(db) && (db as IDictionary).dbType !== undefined;
}

export function isSdk<T extends IDatabaseSdk<ISdk>>(sdk: unknown): sdk is T {
  return (
    isNonNullObject(sdk) && isDatabase(sdk) && (sdk as IDictionary)?.isAdminApi !== undefined
  );
}

/**
 * a _type guard_ which provides a test that the database API or SDK passed
 * is indeed a **Firebase RTDB**.
 */
export function isRealTimeDatabase<T extends IDatabaseSdk<IRtdbSdk>>(db: unknown): db is T {
  return isDatabase(db) && (db as IDictionary)?.dbType === Database.RTDB;
}

export function isFirestoreDatabase<T extends IDatabaseSdk<IFirestoreSdk>>(
  db: unknown
): db is T {
  return isDatabase(db) && (db as IDictionary)?.dbType === Database.Firestore;
}

/** The database connection was established using the Admin SDK */
export function isAdminSdk<T extends IDatabaseSdk<AdminSdk>>(
  sdk: unknown
): sdk is T {
  return isSdk(sdk) && (sdk as IDictionary)?.isAdminApi ? true : false;
}

/** The database connection was established using a Client SDK */
export function isClientSdk<T extends IDatabaseSdk<ClientSdk>>(
  sdk: unknown
): sdk is T {
  return isSdk(sdk) && !(sdk as IDictionary)?.isAdminApi;
}

