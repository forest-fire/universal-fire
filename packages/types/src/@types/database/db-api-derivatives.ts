import { Database } from '../fire-types';
import { IDatabase } from './db-api-base';

/**
 * The base API for Firebase's **Real Time** database.
 *
 * - No **SDK**-_specific_ aspects are included
 */
export interface IRealTimeApi extends IDatabase {
  dbType: Database.RTDB;
}

/**
 * The base API for Firebase's **Firestore** database.
 *
 * - No **SDK**-_specific_ aspects are included
 */
export interface IFirestoreApi extends IDatabase {
  dbType: Database.Firestore;
}
