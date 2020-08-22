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
} from '@forest-fire/types';

import type { Mock as IMockApi } from 'firemock';
export type { IMockApi };

import { IAbstractedDatabase as IGenericAbstractedDatabase } from '@forest-fire/types';
/**
 * The minimial interface/contract for an SDK to be used within universal-fire as
 * an _abstracted database_.
 */
export type IAbstractedDatabase = IGenericAbstractedDatabase<IMockApi>;
