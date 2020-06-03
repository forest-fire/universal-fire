export type { IAdminConfig, IMockConfig, IClientConfig, IRtdbDbEvent, IFirestoreDbEvent, IClientAuth, IAdminAuth, } from '@forest-fire/types';
export { SerializedQuery } from '@forest-fire/base-serializer';
export type { RealTimeClient as IRealTimeClient } from '@forest-fire/real-time-client';
export type { FirestoreClient as IFirestoreClient } from '@forest-fire/firestore-client';
import { IRealTimeDb } from '@forest-fire/real-time-db';
import { IFirestoreDb } from '@forest-fire/firestore-db';
/**
 * Provides an abstracted interface which conforms to either the RTDB or Firestore
 * DB's and their SDK's
 */
export declare type IAbstractedDatabase = IRealTimeDb | IFirestoreDb;
