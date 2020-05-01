export type { ServiceAccount as IServiceAccount } from 'firebase-admin';
import type { auth as adminAuth, app as adminApp } from 'firebase-admin';
export declare type IAdminApp = adminApp.App;
/** The Admin SDK for Firebase Auth */
export declare type IAdminAuth = adminAuth.Auth;
/** The Client SDK for Firebase Auth */
export declare type IClientAuth = import('@firebase/auth-types').FirebaseAuth;
export type { EmailAuthProvider as IEmailAuthProvider } from '@firebase/auth-types';
export declare type FirebaseNamespace = import('@firebase/app-types').FirebaseNamespace;
export type { 
/** `Mock` class from **Firemock** */
Mock as MockDb, 
/** Mock configuration as defined in **Firemock** */
IMockConfigOptions, } from 'firemock';
export type { 
/** the `FirebaseDatabase` API from `@firebase/database-types` */
FirebaseDatabase as IRtdbDatabase, DataSnapshot as IRtdbDataSnapshot, EventType as IRtdbEventType, Reference as IRtdbReference } from '@firebase/database-types';
export type { FirebaseApp as IClientApp } from '@firebase/app-types';
export type { FirebaseFirestore as IFirestoreDatabase, DocumentChangeType as IFirestoreDbEvent, } from '@firebase/firestore-types';
