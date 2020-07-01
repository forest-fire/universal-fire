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
  IPathBasedWatchEvent,
  IValueBasedWatchEvent,
  IAbstractedEvent,
} from '@forest-fire/types';
import type { Mock as IMockApi } from 'firemock';

export { SerializedQuery } from '@forest-fire/serializer-factory';
export type { IComparisonOperator, ISerializedQuery } from '@forest-fire/types';

export { IMockApi };

import { IAbstractedDatabase as IGenericAbstractedDatabase } from '@forest-fire/types';
/**
 * The minimial interface/contract for an SDK to be used within universal-fire as
 * an _abstracted database_.
 */
export type IAbstractedDatabase = IGenericAbstractedDatabase<IMockApi>;
