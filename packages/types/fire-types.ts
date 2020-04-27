import { IDictionary } from 'common-types';
import { IServiceAccount } from './index';

// TYPES THAT ARE SCOPED ACROSS ALL PARTS of FIREBASE

export type ISerializedQuery = any;
export type AsyncMockData = import('firemock').AsyncMockData;
export type DebuggingCallback = (message: string) => void;

export interface IFirebaseBaseConfig {
  /** set debugging override from logging config */
  debugging?: boolean | DebuggingCallback;
  /** whether to load and use a mocking database */
  mocking?: boolean;
  /** set a name for the database; useful when there's more than one */
  name?: string;
  /** TBD  */
  logging?: any;
  /** override the default timeout of 5 seconds */
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
  mockAuth?: import('firemock').IMockAuthConfig;
}

export interface IClientConfig extends IFirebaseBaseConfig {
  apiKey: string;
  authDomain: string;
  /**
   * The URL of the database from which to read and write data.
   */
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
  serviceAccount?: string | IServiceAccount;
  /**
   * The databaseURL _is_ required for use of the Admin SDK but if not passed in as a parameter
   * it can be found in the `FIREBASE_DATABASE_URL` environment variable.
   */
  databaseUrl?: string;
}

/**
 * The data structure saved to a class managing the Admin SDK. The data sourced for this comes from
 * either a combination of the configuration passed in (`IAdminConfig`) and environment variables
 * which were set.
 */
export type IAdminConfigCompleted =
  | (IAdminConfig & {
      serviceAccount: IServiceAccount;
      databaseUrl: string;
    })
  | IMockConfig;

export type IDatabaseConfig = IAdminConfig | IClientConfig | IMockConfig;
