export type {
  IAdminConfig,
  IMockConfig,
  IClientConfig,
  IRtdbDbEvent,
  IFirestoreDbEvent,
  IClientAuth,
  IAdminAuth,
  AuthCredential,
  User,
  UserCredential,
  IdTokenResult,
  ActionCodeSettings,
} from '@forest-fire/types';
export { SerializedQuery } from '@forest-fire/serializer-factory';
export {
  IComparisonOperator,
  BaseSerializer as ISerializedQuery,
} from '@forest-fire/serialized-query';
export type { RealTimeClient as IRealTimeClient } from '@forest-fire/real-time-client';
export type { FirestoreClient as IFirestoreClient } from '@forest-fire/firestore-client';
export type { RealTimeAdmin as IRealTimeAdmin } from '@forest-fire/real-time-admin';
export type { FirestoreAdmin as IFirestoreAdmin } from '@forest-fire/firestore-admin';

import { IRealTimeDb } from '@forest-fire/real-time-db';
import { IFirestoreDb } from '@forest-fire/firestore-db';

/**
 * Provides an abstracted interface which conforms to either the RTDB or Firestore
 * DB's and their SDK's
 */
export type IAbstractedDatabase = IRealTimeDb | IFirestoreDb;

import {
  IPathBasedWatchEvent,
  IValueBasedWatchEvent,
} from '@forest-fire/real-time-db';

export { IPathBasedWatchEvent, IValueBasedWatchEvent };
export type IWatchEvent = IPathBasedWatchEvent | IValueBasedWatchEvent;
