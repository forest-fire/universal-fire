import { Database } from '../fire-types';
import { IDatabaseApi } from './db-api-base';

/**
 * The base API for Firebase's **Real Time** database.
 *
 * - No **SDK**-_specific_ aspects are included
 */
export type IRealTimeApi = IDatabaseApi<Database.RTDB>;

/**
 * The base API for Firebase's **Firestore** database.
 *
 * - No **SDK**-_specific_ aspects are included
 */
export type IFirestoreApi = IDatabaseApi<Database.Firestore>;
