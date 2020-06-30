export type { IAdminConfig, IMockConfig, IClientConfig, IRtdbDbEvent, IFirestoreDbEvent, IClientAuth, IAdminAuth, AuthCredential, User, UserCredential, IdTokenResult, ActionCodeSettings, IPathBasedWatchEvent, IValueBasedWatchEvent, IAbstractedEvent, } from '@forest-fire/types';
import type { Mock as IMockApi } from 'firemock';
export { SerializedQuery } from '@forest-fire/serializer-factory';
import type { IComparisonOperator, ISerializedQuery as ISQ } from '@forest-fire/types';
export declare type ISerializedQuery = ISQ<IMockApi>;
export { IComparisonOperator, IMockApi };
import { IAbstractedDatabase as IAD } from '@forest-fire/types';
export declare type IAbstractedDatabase = IAD<IMockApi>;
