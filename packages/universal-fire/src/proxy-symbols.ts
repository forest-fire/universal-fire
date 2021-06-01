export type {
  IMockConfig,
  IRtdbDbEvent,
  IFirestoreDbEvent,
  AuthCredential,
  User,
  UserCredential,
  IdTokenResult,
  ActionCodeSettings,
  IPathBasedWatchEvent,
  IValueBasedWatchEvent,
  IAbstractedEvent,
  IAdminConfig,
  IClientConfig,
  IClientAuth,
  IAdminAuth,
} from '@forest-fire/types';
export { SDK } from '@forest-fire/types';

export { SerializedQuery } from '@forest-fire/serializer-factory';
export type {
  IComparisonOperator,
  ISerializedQuery,
  ISerializedIdentity,
  IAbstractedDatabase,
  IFirestoreAdmin,
  IFirestoreClient,
  IRealTimeAdmin,
  IRealTimeClient,
} from '@forest-fire/types';

import type { Mock as IMockApi } from 'firemock';
export type { IMockApi };
