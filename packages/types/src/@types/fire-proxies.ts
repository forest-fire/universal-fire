import type {
  auth as adminAuth,
  app as adminApp,
  database as adminDatabase,
  firestore as adminFirestore,
} from 'firebase-admin';
import {
  /** the `FirebaseDatabase` API from `@firebase/database-types` */
  FirebaseDatabase as IClientRtdbDatabase,
} from '@firebase/database-types';
import { FirebaseFirestore as IClientFirestoreDatabase } from '@firebase/firestore-types';

export type { ServiceAccount as IServiceAccount } from 'firebase-admin';

export type IAdminApp = adminApp.App;

/** The Admin SDK for Firebase Auth */
export type IAdminAuth = adminAuth.Auth;
/** The Client SDK for Firebase Auth */
export type IClientAuth = import('@firebase/auth-types').FirebaseAuth;

/** The Admin database API provided by RTDB */
export type IAdminRtdbDatabase = adminDatabase.Database;

export type IAdminFirestoreDatabase = adminFirestore.Firestore;

export type { EmailAuthProvider as IEmailAuthProvider } from '@firebase/auth-types';
export type FirebaseNamespace = import('@firebase/app-types').FirebaseNamespace;

export type {
  /** `Mock` class from **Firemock** */
  Mock as MockDb,
  /** Mock configuration as defined in **Firemock** */
  IMockConfigOptions,
} from 'firemock';

export type {
  DataSnapshot as IRtdbDataSnapshot,
  EventType as IRtdbEventType,
  Reference as IRtdbReference,
  ThenableReference as IRtdbThenableReference,
  OnDisconnect as IRtdbOnDisconnect,
} from '@firebase/database-types';

export type { FirebaseApp as IClientApp } from '@firebase/app-types';

export type { DocumentChangeType as IFirestoreDbEvent } from '@firebase/firestore-types';

export type IRtdbDatabase = IClientRtdbDatabase | IAdminRtdbDatabase;

export type IFirestoreDatabase =
  | IClientFirestoreDatabase
  | IAdminFirestoreDatabase;
