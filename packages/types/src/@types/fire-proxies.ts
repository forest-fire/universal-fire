import type {
  auth as adminAuth,
  app as adminApp,
  database as adminDatabase,
  firestore as adminFirestore,
} from 'firebase-admin';

// TODO: we should prefix the types with "I".

//#region Client Auth API
export type IClientAuth = import('@firebase/auth-types').FirebaseAuth;
export type IClientAuthProviders = FirebaseNamespace['auth'];
export type ActionCodeInfo = import('@firebase/auth-types').ActionCodeInfo;
export type ActionCodeSettings = import('@firebase/auth-types').ActionCodeSettings;
export type AdditionalUserInfo = import('@firebase/auth-types').AdditionalUserInfo;
export type ApplicationVerifier = import('@firebase/auth-types').ApplicationVerifier;
export type AuthCredential = import('@firebase/auth-types').AuthCredential;
export type AuthProvider = import('@firebase/auth-types').AuthProvider;
export type ConfirmationResult = import('@firebase/auth-types').ConfirmationResult;
export type AuthSettings = import('@firebase/auth-types').AuthSettings;
export type EmailAuthProvider_Instance = import('@firebase/auth-types').EmailAuthProvider_Instance;
export type FacebookAuthProvider_Instance = import('@firebase/auth-types').FacebookAuthProvider_Instance;
export type FirebaseAuth = import('@firebase/auth-types').FirebaseAuth;
export type GithubAuthProvider_Instance = import('@firebase/auth-types').GithubAuthProvider_Instance;
export type GoogleAuthProvider = import('@firebase/auth-types').GoogleAuthProvider;
export type GoogleEmailAuthProvider = import('@firebase/auth-types').EmailAuthProvider;
export type GoogleFacebookAuthProvider = import('@firebase/auth-types').FacebookAuthProvider;
export type GoogleGithubAuthProvider = import('@firebase/auth-types').GithubAuthProvider;
export type GooglePhoneAuthProvider = import('@firebase/auth-types').PhoneAuthProvider;
export type GoogleRecaptchaVerifier = import('@firebase/auth-types').RecaptchaVerifier;
export type IdTokenResult = import('@firebase/auth-types').IdTokenResult;
export type IEmailAuthProvider = import('@firebase/auth-types').EmailAuthProvider;
export type OAuthCredential = import('@firebase/auth-types').OAuthCredential;
export type OAuthProvider = import('@firebase/auth-types').OAuthProvider;
export type Persistence = import('@firebase/auth-types').Persistence;
export type PhoneAuthProvider_Instance = import('@firebase/auth-types').PhoneAuthProvider_Instance;
export type RecaptchaVerifier_Instance = import('@firebase/auth-types').RecaptchaVerifier_Instance;
export type SAMLAuthProvider = import('@firebase/auth-types').SAMLAuthProvider;
export type TwitterAuthProvider = import('@firebase/auth-types').TwitterAuthProvider;
export type TwitterAuthProvider_Instance = import('@firebase/auth-types').TwitterAuthProvider_Instance;
export type UserCredential = import('@firebase/auth-types').UserCredential;
export type User = import('@firebase/auth-types').User;
//#endregion Client Auth API

//#region Client App API
export type FirebaseNamespace = import('@firebase/app-types').FirebaseNamespace;
/**
 * The root Firebase App API surface where you can engage services such as `database()`,
 * `firestore()`, `storage()`, etc.
 */
export type IFirebaseApp = FirebaseNamespace['app'];
export type IClientApp = import('@firebase/app-types').FirebaseApp;
//#endregion Client App API

//#region Client Rtdb API
export type IClientRtdbDatabase = import('@firebase/database-types').FirebaseDatabase;
export type IRealTimeQuery = import('@firebase/database-types').Query;
export type IRtdbDataSnapshot = import('@firebase/database-types').DataSnapshot;
export type IRtdbDbEvent = import('@firebase/database-types').EventType;
export type IRtdbOnDisconnect = import('@firebase/database-types').OnDisconnect;
export type IRtdbQuery = import('@firebase/database-types').Query;
export type IRtdbReference = import('@firebase/database-types').Reference;
export type IRtdbThenableReference = import('@firebase/database-types').ThenableReference;
//#endregion Client Rtdb API

//#region Client Firestore API
export type IClientFirestoreDatabase = import('@firebase/firestore-types').FirebaseFirestore;
export type IFirestoreDbEvent = import('@firebase/firestore-types').DocumentChangeType;
export type IFirestoreQuery = import('@firebase/firestore-types').Query;
export type IFirestoreQuerySnapshot = import('@firebase/firestore-types').QuerySnapshot;
//#endregion Client Firestore API

//#region Admin Auth API
export type Auth = import('firebase-admin').auth.Auth;
export type CreateRequest = import('firebase-admin').auth.CreateRequest;
export type DecodedIdToken = import('firebase-admin').auth.DecodedIdToken;
export type ListUsersResult = import('firebase-admin').auth.ListUsersResult;
export type UpdateRequest = import('firebase-admin').auth.UpdateRequest;
export type UserRecord = import('firebase-admin').auth.UserRecord;
export type IAdminAuth = adminAuth.Auth;
//#endregion Admin Auth API

//#region Admin App API
import type admin from 'firebase-admin';
export interface IAdminDatabaseApi {
  DataSnapshot: admin.database.DataSnapshot;
  Database: admin.database.Database;
  EventType: admin.database.EventType;
  OnDisconnect: admin.database.OnDisconnect;
  Query: admin.database.Query;
  Reference: admin.database.Reference;
  ThenableReference: admin.database.ThenableReference;
}
export interface IAdminAuthApi {
  ActionCodeSettings: admin.auth.ActionCodeSettings;
  Auth: admin.auth.Auth;
  AuthProviderConfig: admin.auth.AuthProviderConfig;
  AuthProviderConfigFilter: admin.auth.AuthProviderConfigFilter;
  BaseAuth: admin.auth.BaseAuth;
  CreateMultiFactorInfoRequest: admin.auth.CreateMultiFactorInfoRequest;
  CreatePhoneMultiFactorInfoRequest: admin.auth.CreatePhoneMultiFactorInfoRequest;
  CreateRequest: admin.auth.CreateRequest;
  CreateTenantRequest: admin.auth.CreateTenantRequest;
  DecodedIdToken: admin.auth.DecodedIdToken;
  DeleteUsersResult: admin.auth.DeleteUsersResult;
  GetUsersResult: admin.auth.GetUsersResult;
  HashAlgorithmType: admin.auth.HashAlgorithmType;
  ListProviderConfigResults: admin.auth.ListProviderConfigResults;
  ListTenantsResult: admin.auth.ListTenantsResult;
  ListUsersResult: admin.auth.ListUsersResult;
  MultiFactorCreateSettings: admin.auth.MultiFactorCreateSettings;
  MultiFactorInfo: admin.auth.MultiFactorInfo;
  MultiFactorUpdateSettings: admin.auth.MultiFactorUpdateSettings;
  OIDCAuthProviderConfig: admin.auth.OIDCAuthProviderConfig;
  OIDCUpdateAuthProviderRequest: admin.auth.OIDCUpdateAuthProviderRequest;
  PhoneMultiFactorInfo: admin.auth.PhoneMultiFactorInfo;
  SAMLAuthProviderConfig: admin.auth.SAMLAuthProviderConfig;
  SAMLUpdateAuthProviderRequest: admin.auth.SAMLUpdateAuthProviderRequest;
  SessionCookieOptions: admin.auth.SessionCookieOptions;
  Tenant: admin.auth.Tenant;
  TenantAwareAuth: admin.auth.TenantAwareAuth;
  TenantManager: admin.auth.TenantManager;
  UpdateAuthProviderRequest: admin.auth.UpdateAuthProviderRequest;
  UpdateMultiFactorInfoRequest: admin.auth.UpdateMultiFactorInfoRequest;
  UpdateRequest: admin.auth.UpdateRequest;
  UpdateTenantRequest: admin.auth.UpdateTenantRequest;
  UserImportOptions: admin.auth.UserImportOptions;
  UserImportRecord: admin.auth.UserImportRecord;
  UserImportResult: admin.auth.UserImportResult;
  UserInfo: admin.auth.UserInfo;
  UserMetadata: admin.auth.UserMetadata;
  UserRecord: admin.auth.UserRecord;
}

export interface IAdminMessagingApi {
  AndroidConfig: admin.messaging.AndroidConfig;
  AndroidFcmOptions: admin.messaging.AndroidFcmOptions;
  AndroidNotification: admin.messaging.AndroidNotification;
  ApnsConfig: admin.messaging.ApnsConfig;
  ApnsFcmOptions: admin.messaging.ApnsFcmOptions;
  ApnsPayload: admin.messaging.ApnsPayload;
  Aps: admin.messaging.Aps;
  ApsAlert: admin.messaging.ApsAlert;
  BatchResponse: admin.messaging.BatchResponse;
  CriticalSound: admin.messaging.CriticalSound;
  DataMessagePayload: admin.messaging.DataMessagePayload;
  FcmOptions: admin.messaging.FcmOptions;
  LightSettings: admin.messaging.LightSettings;
  Message: admin.messaging.Message;
  Messaging: admin.messaging.Messaging;
  MessagingConditionResponse: admin.messaging.MessagingConditionResponse;
  MessagingDeviceGroupResponse: admin.messaging.MessagingDeviceGroupResponse;
  MessagingDeviceResult: admin.messaging.MessagingDeviceResult;
  /** more */
}

export interface IAdminFirestoreApi {
  CollectionReference: admin.firestore.CollectionReference;
  DocumentData: admin.firestore.DocumentData;
  DocumentReference: admin.firestore.DocumentReference;
  DocumentSnapshot: admin.firestore.DocumentSnapshot;
  FieldPath: admin.firestore.FieldPath;
  FieldValue: admin.firestore.FieldValue;
  Firestore: admin.firestore.Firestore;
  GeoPoint: admin.firestore.GeoPoint;
  Query: admin.firestore.Query;
  QueryDocumentSnapshot: admin.firestore.QueryDocumentSnapshot;
  QuerySnapshot: admin.firestore.QuerySnapshot;
  Timestamp: admin.firestore.Timestamp;
  Transaction: admin.firestore.Transaction;
  WriteBatch: admin.firestore.WriteBatch;
  WriteResult: admin.firestore.WriteResult;
}

/** this is a partially complete typing of Admin interface */
export interface IAdminFirebaseNamespace {
  app: (name?: string) => admin.app.App;
  apps: (admin.app.App | null)[];
  initializeApp: (options?: admin.AppOptions, name?: string) => admin.app.App;
  AppOptions: admin.AppOptions;
  database: () => IAdminDatabaseApi;
  firestore: (app?: any) => IAdminFirestoreApi;
  auth: ((app?: any) => IAdminAuth) & IAdminAuthApi;
  messaging: () => IAdminMessagingApi;
  serviceAccount: admin.ServiceAccount;
  GoogleOAuthAccessToken: admin.GoogleOAuthAccessToken;
  credential: {
    cert: (
      serviceAccountPathOrObject: string | admin.ServiceAccount
    ) => admin.credential.Credential;
    /** more */
  };
}
export type IServiceAccount = admin.ServiceAccount;
export type IAdminApp = adminApp.App;
//#endregion Admin App API

//#region Admin Firestore API
export type IAdminFirestoreDatabase = adminFirestore.Firestore;
export type IFirestoreDatabase =
  | IClientFirestoreDatabase
  | IAdminFirestoreDatabase;
//#endregion Admin Firestore API

//#region Admin Rtdb API
export type IAdminRtdbDatabase = adminDatabase.Database;
export type IRtdbDatabase = IClientRtdbDatabase | IAdminRtdbDatabase;
//#endregion Admin Rtdb API

//#region Merged Types
/** watcher events from either Firestore or RealTime database*/
export type IAbstractedEvent = IRtdbDbEvent | IFirestoreDbEvent;
//#endregion Merged Types
