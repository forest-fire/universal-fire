/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IAdminApp,
  IAdminAuth,
  IAdminFirestoreDatabase,
  IAdminRtdbDatabase,
  IClientApp,
  IClientAuth,
  IClientAuthProviders,
  IClientFirestoreDatabase,
  IClientRtdbDatabase,
  IFirestoreDbEvent,
  IRtdbDbEvent,
} from '../fire-proxies';
import { AdminSdk, IAdminConfig, IClientConfig, IFirestoreSdk, IMockConfig, ISdk } from '../fire-types';
import { IRtdbSnapshot } from '../proxy-plus';
import { IFirebaseCollectionReference, IFirebaseRtdbQuery } from '../query';
import { IFirestoreQuerySnapshot } from '../snapshot';

export type DbFrom<T extends ISdk> = T extends 'FirestoreAdmin'
  ? IAdminFirestoreDatabase
  : T extends 'FirestoreClient'
  ? IClientFirestoreDatabase
  : T extends 'RealTimeAdmin'
  ? IAdminRtdbDatabase
  : IClientRtdbDatabase;


/**
 * Get the Db _type_ (aka, Firestore or RTDB) from the SDK
 */
export type DbTypeFrom<T extends ISdk> = T extends IFirestoreSdk
  ? 'Firestore'
  : 'RTDB';

/**
 * Given a known SDK, it will provide the appropriate type for a derserialized query
 */
export type DeserializedQueryFrom<T extends ISdk> = T extends IFirestoreSdk
  ? IFirebaseCollectionReference<any>
  : IFirebaseRtdbQuery;

export type SnapshotFrom<T extends ISdk> = T extends IFirestoreSdk
  ? IFirestoreQuerySnapshot<any>
  : IRtdbSnapshot;

export type EventFrom<T extends ISdk> = T extends IFirestoreSdk
  ? IFirestoreDbEvent
  : IRtdbDbEvent;

export type AuthFrom<T extends ISdk> = T extends AdminSdk
  ? IAdminAuth
  : IClientAuth;

export type AuthProviders<T extends ISdk> = T extends AdminSdk
  ? undefined
  : IClientAuthProviders;

/**
 * Returns either an _admin_ or _client_ `app` API from firebase
 * (based on the SDK being used).
 */
export type AppFrom<T extends ISdk> = T extends AdminSdk ? IAdminApp : IClientApp;

/**
 * Typescript utility type which takes the SDK as a generic parameter and returns a
 * true or false value indicating whether the SDK is an _admin_ SDK
 */
export type IsAdminSdk<T extends ISdk> = T extends AdminSdk ? true : false;

export type DbConfigFrom<T extends ISdk> = T extends AdminSdk
  ? IAdminConfig | IMockConfig
  : IClientConfig | IMockConfig;