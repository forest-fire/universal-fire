import { IDictionary, isNonNullObject } from 'common-types';
import { AdminSdk, ClientSdk, Database, IFirestoreSdk, IRtdbSdk, ISdk, SDK } from '../fire-types';
import { IDatabaseSdk } from './db-sdk';

/**
 * Type guard to validate that the passed in variable is in fact
 * a database which implements `IDatabaseSdk`.
 */
export function isDatabase<T extends IDatabaseSdk<ISdk>>(db: unknown): db is T {
  return isNonNullObject(db) && (db as IDictionary).dbType !== undefined;
}

/**
 * Tests whether the given input is a valid SDK string
 */
export function isSdk(sdk: unknown): sdk is SDK {
  return typeof sdk === "string" && [SDK.FirestoreAdmin, SDK.FirestoreClient, SDK.RealTimeAdmin, SDK.RealTimeClient].includes(sdk as SDK);
}

/**
 * a _type guard_ which provides a test that the database API or SDK passed
 * is indeed a **Firebase RTDB**.
 */
export function isRealTimeDatabase<T extends IDatabaseSdk<IRtdbSdk>>(db: unknown): db is T {
  return isDatabase(db) && (db as IDictionary)?.dbType === Database.RTDB;
}

/**
 * Type guard that checks that a given SDK is for the Firestore Database
 */
export function isFirestoreDatabase(
  sdk: unknown
): sdk is IFirestoreSdk {
  return isSdk(sdk) && [SDK.FirestoreAdmin, SDK.FirestoreClient].includes(sdk);
}

/** The database connection was established using the Admin SDK */
export function isAdminSdk(
  sdk: unknown
): sdk is AdminSdk {
  return isSdk(sdk) && [SDK.RealTimeAdmin, SDK.FirestoreAdmin].includes(sdk);
}

/** 
 * Based on the SDK, this is a _client_ API
 */
export function isClientSdk(
  sdk: unknown
): sdk is ClientSdk {
  return isSdk(sdk) && [SDK.FirestoreClient, SDK.RealTimeClient].includes(sdk);
}

