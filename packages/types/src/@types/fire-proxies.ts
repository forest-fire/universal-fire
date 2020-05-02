export type {ServiceAccount as IServiceAccount} from 'firebase-admin';
import type {auth as adminAuth, app as adminApp, database as adminDatabase} from 'firebase-admin';
import { IClientRtdbDatabase } from '..';
export type IAdminApp = adminApp.App
/** The Admin SDK for Firebase Auth */
export type IAdminAuth = adminAuth.Auth;

/** The Admin database API provided by RTDB */
export type IAdminRtdbDatabase = adminDatabase.Database

/** The Client SDK for Firebase Auth */
export type IClientAuth = import('@firebase/auth-types').FirebaseAuth;
export type { EmailAuthProvider as IEmailAuthProvider } from '@firebase/auth-types'
export type FirebaseNamespace = import('@firebase/app-types').FirebaseNamespace;

export type {
  /** `Mock` class from **Firemock** */
  Mock as MockDb,
  /** Mock configuration as defined in **Firemock** */
  IMockConfigOptions,
} from 'firemock'

export type {
  /** the `FirebaseDatabase` API from `@firebase/database-types` */
  FirebaseDatabase as IClientRtdbDatabase,
  DataSnapshot as IRtdbDataSnapshot,
  EventType as IRtdbEventType,
  Reference as IRtdbReference,
  ThenableReference as IRtdbThenableReference,
  OnDisconnect as IRtdbOnDisconnect
} from '@firebase/database-types';

export type {
  FirebaseApp as IClientApp
} from '@firebase/app-types'

export type {
  FirebaseFirestore as IFirestoreDatabase,
  DocumentChangeType as IFirestoreDbEvent,
} from '@firebase/firestore-types'

export type IRtdbDatabase = IClientRtdbDatabase | IAdminRtdbDatabase