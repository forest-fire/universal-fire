import type { auth as adminAuth, app as adminApp, database as adminDatabase, firestore as adminFirestore } from 'firebase-admin';
export declare type IClientAuth = import('@firebase/auth-types').FirebaseAuth;
export declare type IClientAuthProviders = FirebaseNamespace['auth'];
export declare type ActionCodeInfo = import('@firebase/auth-types').ActionCodeInfo;
export declare type ActionCodeSettings = import('@firebase/auth-types').ActionCodeSettings;
export declare type AdditionalUserInfo = import('@firebase/auth-types').AdditionalUserInfo;
export declare type ApplicationVerifier = import('@firebase/auth-types').ApplicationVerifier;
export declare type AuthCredential = import('@firebase/auth-types').AuthCredential;
export declare type AuthProvider = import('@firebase/auth-types').AuthProvider;
export declare type ConfirmationResult = import('@firebase/auth-types').ConfirmationResult;
export declare type AuthSettings = import('@firebase/auth-types').AuthSettings;
export declare type EmailAuthProvider_Instance = import('@firebase/auth-types').EmailAuthProvider_Instance;
export declare type FacebookAuthProvider_Instance = import('@firebase/auth-types').FacebookAuthProvider_Instance;
export declare type FirebaseAuth = import('@firebase/auth-types').FirebaseAuth;
export declare type GithubAuthProvider_Instance = import('@firebase/auth-types').GithubAuthProvider_Instance;
export declare type GoogleAuthProvider = import('@firebase/auth-types').GoogleAuthProvider;
export declare type GoogleEmailAuthProvider = import('@firebase/auth-types').EmailAuthProvider;
export declare type GoogleFacebookAuthProvider = import('@firebase/auth-types').FacebookAuthProvider;
export declare type GoogleGithubAuthProvider = import('@firebase/auth-types').GithubAuthProvider;
export declare type GooglePhoneAuthProvider = import('@firebase/auth-types').PhoneAuthProvider;
export declare type GoogleRecaptchaVerifier = import('@firebase/auth-types').RecaptchaVerifier;
export declare type IdTokenResult = import('@firebase/auth-types').IdTokenResult;
export declare type IEmailAuthProvider = import('@firebase/auth-types').EmailAuthProvider;
export declare type OAuthCredential = import('@firebase/auth-types').OAuthCredential;
export declare type OAuthProvider = import('@firebase/auth-types').OAuthProvider;
export declare type Persistence = import('@firebase/auth-types').Persistence;
export declare type PhoneAuthProvider_Instance = import('@firebase/auth-types').PhoneAuthProvider_Instance;
export declare type RecaptchaVerifier_Instance = import('@firebase/auth-types').RecaptchaVerifier_Instance;
export declare type SAMLAuthProvider = import('@firebase/auth-types').SAMLAuthProvider;
export declare type TwitterAuthProvider = import('@firebase/auth-types').TwitterAuthProvider;
export declare type TwitterAuthProvider_Instance = import('@firebase/auth-types').TwitterAuthProvider_Instance;
export declare type UserCredential = import('@firebase/auth-types').UserCredential;
export declare type User = import('@firebase/auth-types').User;
export declare type FirebaseNamespace = import('@firebase/app-types').FirebaseNamespace;
/**
 * The root Firebase App API surface where you can engage services such as `database()`,
 * `firestore()`, `storage()`, etc.
 */
export declare type IFirebaseApp = FirebaseNamespace['app'];
export declare type IClientApp = import('@firebase/app-types').FirebaseApp;
export declare type IClientRtdbDatabase = import('@firebase/database-types').FirebaseDatabase;
export declare type IRealTimeQuery = import('@firebase/database-types').Query;
export declare type IRtdbDataSnapshot = import('@firebase/database-types').DataSnapshot;
export declare type IRtdbDbEvent = import('@firebase/database-types').EventType;
export declare type IRtdbOnDisconnect = import('@firebase/database-types').OnDisconnect;
export declare type IRtdbQuery = import('@firebase/database-types').Query;
export declare type IRtdbReference = import('@firebase/database-types').Reference;
export declare type IRtdbThenableReference = import('@firebase/database-types').ThenableReference;
export declare type IClientFirestoreDatabase = import('@firebase/firestore-types').FirebaseFirestore;
export declare type IFirestoreDbEvent = import('@firebase/firestore-types').DocumentChangeType;
export declare type IFirestoreQuery = import('@firebase/firestore-types').Query;
export declare type IFirestoreQuerySnapshot = import('@firebase/firestore-types').QuerySnapshot;
export declare type Auth = import('firebase-admin').auth.Auth;
export declare type CreateRequest = import('firebase-admin').auth.CreateRequest;
export declare type DecodedIdToken = import('firebase-admin').auth.DecodedIdToken;
export declare type ListUsersResult = import('firebase-admin').auth.ListUsersResult;
export declare type UpdateRequest = import('firebase-admin').auth.UpdateRequest;
export declare type UserRecord = import('firebase-admin').auth.UserRecord;
export declare type IAdminAuth = adminAuth.Auth;
import type { default as admin } from 'firebase-admin';
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
        cert: (serviceAccountPathOrObject: string | admin.ServiceAccount) => admin.credential.Credential;
    };
}
export declare type IServiceAccount = admin.ServiceAccount;
export declare type IAdminApp = adminApp.App;
export declare type IAdminFirestoreDatabase = adminFirestore.Firestore;
export declare type IFirestoreDatabase = IClientFirestoreDatabase | IAdminFirestoreDatabase;
export declare type IAdminRtdbDatabase = adminDatabase.Database;
export declare type IRtdbDatabase = IClientRtdbDatabase | IAdminRtdbDatabase;
/** watcher events from either Firestore or RealTime database*/
export declare type IAbstractedEvent = IRtdbDbEvent | IFirestoreDbEvent;
