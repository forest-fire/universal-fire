// export * from './proxy-symbols';
export { IAbstractedDatabase } from '@forest-fire/abstracted-database';
export { RealTimeClient } from '@forest-fire/real-time-client';
export { FirestoreClient } from '@forest-fire/firestore-client';
export { RealTimeAdmin } from '@forest-fire/real-time-admin';
export { FirestoreAdmin } from '@forest-fire/firestore-admin';

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
export type {
  IComparisonOperator,
  ISerializedQuery,
} from '@forest-fire/serialized-query';
export type { RealTimeClient as IRealTimeClient } from '@forest-fire/real-time-client';
export type { FirestoreClient as IFirestoreClient } from '@forest-fire/firestore-client';
export type { RealTimeAdmin as IRealTimeAdmin } from '@forest-fire/real-time-admin';
export type { FirestoreAdmin as IFirestoreAdmin } from '@forest-fire/firestore-admin';

import {
  IPathBasedWatchEvent,
  IValueBasedWatchEvent,
} from '@forest-fire/real-time-db';

export { IPathBasedWatchEvent, IValueBasedWatchEvent };
export type IWatchEvent = IPathBasedWatchEvent | IValueBasedWatchEvent;
