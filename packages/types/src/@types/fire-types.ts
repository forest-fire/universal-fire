import type { IDictionary } from 'common-types';
import type {
  IServiceAccount,
  UserRecord,
  IEmailAuthProvider,
  IClientAuth,
} from '../index';

export type FakerStatic = typeof import('faker');

export const enum AuthProviderName {
  emailPassword = 'emailPassword',
  phone = 'phone',
  google = 'google',
  playGames = 'playGames',
  gameCenter = 'gameCenter',
  facebook = 'facebook',
  twitter = 'twitter',
  github = 'github',
  yahoo = 'yahoo',
  microsoft = 'microsoft',
  apple = 'apple',
  anonymous = 'anonymous',
}

export type IAuthProviderName = keyof typeof AuthProviderName;

export interface IAuthProviders {
  EmailAuthProvider: IEmailAuthProvider;
}

/**
 * A simplification of the full Mock API. Used as a proxy to the full API to
 * avoid the circular dependency.
 */
export interface ISimplifiedMockApi extends IDictionary {
  faker: FakerStatic;
  generate: () => void;
}

/**
 * The configuration of the **Auth** mocking service.
 */
export interface IMockAuthConfig {
  /** The auth providers which have been enabled for this app */
  providers: IAuthProviderName[] | (() => Promise<IAuthProviderName[]>);
  /** Arrya of known users who should be in the mock Auth system to start. */
  users?: IMockUser[] | (() => Promise<IMockUser[]>);
}

export interface IMockConfigOptions {
  auth?: IMockAuthConfig;
  /**
   * Sets the initial state of the mock database, or optionally you can
   * pass in an async function which will resolve into the state of the
   * database.
   */
  db?: IDictionary | AsyncMockData;
}

/**
 * Firemock's internal representation of a user.
 *
 * This representation extends the Admin SDK's `UserRecord` interface but is different from the
 * Client SDK's `User` and `UserCredential` interfaces.
 *
 * > **Note:** external users configuring the mock DB will just use the `IMockUser`
 * > type -- a simplified requirement -- and when it is consumed by Firemock via the
 * > API it will be converted to `IMockRecord`.
 */
export interface IMockUserRecord extends UserRecord {
  kind: 'MockUserRecord';
  /** Optionally sets a fixed UID for this user. */
  uid: string;
  isAnonymous?: boolean;
  /** Optionally gives the user a set of claims. */
  claims?: IDictionary;
  /**
   * Optionally state token Ids which should be returned when calling
   * the `getTokenId()` method. This is useful if you have an associated
   * set of "valid (or invalid) tokens" in your testing environment.
   */
  tokenIds?: string[];
  displayName?: string;
  disabled: boolean;
  phoneNumber?: string;
  photoURL?: string;
  email?: string;
  password?: string;
  /**
   * Indicates whether the user has _verified_ their email ownership by clicking
   * on the verification link.
   */
  emailVerified: boolean;
}

/**
 * Provides a full FirebaseAuth implementation (although many
 * parts are un-implementated currently) as well as extending
 * to add an "administrative" API for mocking.
 */
export interface IMockAuth extends IClientAuth, IAuthProviders {}

/**
 * A basic configuration for a user that allows default values to fill in some of
 * the non-essential properties which Firebase requires (but Firemock is less sensative
 * to)
 */
export type IMockUser = Omit<
  IMockUserRecord,
  | 'emailVerified'
  | 'disabled'
  | 'uid'
  | 'toJSON'
  | 'providerData'
  | 'metadata'
  | 'kind'
> & {
  emailVerified?: boolean;
  disabled?: boolean;
  uid?: string;
  isAnonymous?: boolean;
};

export type DebuggingCallback = (message: string) => void;

/** an _async_ mock function which returns a dictionary data structure */
export type AsyncMockData = (db: ISimplifiedMockApi) => Promise<IDictionary>;

export interface IFirebaseBaseConfig {
  /** Flag to set debugging override from logging configuration. */
  debugging?: boolean | DebuggingCallback;
  /** Flag to whether to load and use a mocking database. */
  mocking?: boolean;
  /** Flag to set a name for the database; useful when there's more than one. */
  name?: string;
  /**
   * The URL of the database from which to read and write data.
   */
  databaseURL?: string;
  apiKey?: string;
  logging?: any;
  /** Override the default timeout of 5 seconds. */
  timeout?: number;
  /**
   * Allows users to state whether the Firebase auth module is going to
   * used. If not stated, the default assumption is that it _should_ be used.
   */
  useAuth?: boolean;
}

export interface IMockConfig extends IFirebaseBaseConfig {
  mocking: true;
  /**
   * Initializes the database to a known state.
   *
   * You can either put in a dictionary if it's available synchronously
   * or you can pass in an async function which resolves to the dictionary
   * asynchronously
   */
  mockData?: IDictionary | AsyncMockData;
  /** optionally configure mocking for Firebase Authentication */
  mockAuth?: IMockAuthConfig;
}

export interface IClientConfig extends IFirebaseBaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  /**
   * The ID of the Google Cloud project associated with the App.
   */
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  mocking?: false;
}

export interface IAdminConfig extends IFirebaseBaseConfig {
  /**
   * The means of authenticating to the Admin API is by using a service account; a service account
   * can either be a structured object (aka, `IServiceAccount`) or a base64 string of the JSON output
   * of an instance of `IServiceAccount`.
   *
   * This is a required attribute for using the Admin SDK but you can leave it off of the passed in
   * configuration so long as the ENV variable `FIREBASE_SERVICE_ACCOUNT` is set.
   */
  serviceAccount: string | IServiceAccount;
  /**
   * The databaseURL _is_ required for use of the Admin SDK but if not passed in as a parameter
   * it can be found in the `FIREBASE_DATABASE_URL` environment variable.
   */
  databaseURL: string;
}

export type IDatabaseConfig = IAdminConfig | IClientConfig | IMockConfig;

/**
 * **IEmitter**
 *
 * Where there's a need to node-style events the common interface to be used
 * should conform to this interface. This is simplify the interface and ensure
 * that possible variations between Node's event emitter and the browser version
 * provided by the `event-emitter` **npm** module are are abstracted away.
 */
export interface IEmitter {
  emit: (event: string | symbol, ...args: any[]) => boolean;
  on: (event: string, value: any) => any;
  once: (event: string, value: any) => any;
}

/**
 * An SDK that Firemodel supports connecting to Firebase by the
 * equivalently named SDK.
 */
export enum SDK {
  FirestoreAdmin = 'FirestoreAdmin',
  FirestoreClient = 'FirestoreClient',
  RealTimeAdmin = 'RealTimeAdmin',
  RealTimeClient = 'RealTimeClient',
}

export enum Database {
  Firestore = 'Firestore',
  RTDB = 'RTDB',
}
