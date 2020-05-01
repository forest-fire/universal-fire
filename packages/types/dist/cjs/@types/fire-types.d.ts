import type { IDictionary } from 'common-types';
import type { IServiceAccount } from '../index';
import type { IMockAuthConfig, AsyncMockData } from 'firemock';
export declare type DebuggingCallback = (message: string) => void;
export interface IFirebaseBaseConfig {
    /** set debugging override from logging config */
    debugging?: boolean | DebuggingCallback;
    /** whether to load and use a mocking database */
    mocking?: boolean;
    /** set a name for the database; useful when there's more than one */
    name?: string;
    /**
     * The URL of the database from which to read and write data.
     */
    databaseURL?: string;
    apiKey?: string;
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
export declare type IDatabaseConfig = IAdminConfig | IClientConfig | IMockConfig;
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
