import { IAbstractedEvent, IAdminAuth, IClientAuth, IClientAuthProviders, IDatabaseConfig, ISerializedQuery, SDK } from '../index';
import { IDictionary } from 'common-types';
/**
 * The public contract that any SDK client must meet to behave
 * like an _abstracted database_.
 */
export interface IAbstractedDatabase<TMock = IDictionary> {
    /** the Firebase SDK which is being used as an abstracted database */
    sdk: SDK;
    /** the Firebase App instance for this DB connection */
    app: IAppInfo;
    /**
     * The "auth providers" such as Github, Facebook, but also EmailAndPassword, etc.
     * Each provider then exposes their own API surface to interact with.
     */
    authProviders: IClientAuthProviders;
    /**
     * Connect to the database
     */
    connect: () => Promise<any>;
    /**
     * Get access to the Firebase Auth API
     */
    auth: () => Promise<IClientAuth | IAdminAuth>;
    /**
     * Boolean flag indicating whether the underlying database connection is using
     * an Admin SDK.
     */
    isAdminApi: boolean;
    /**
     * A boolean flag indicating whether the underlying database is a _mock_ database.
     */
    isMockDb: boolean;
    isConnected: boolean;
    config: IDatabaseConfig;
    mock: TMock;
    ref: (path?: string) => any;
    getList: <T = any>(path: string | ISerializedQuery<T>, idProp?: string) => Promise<T[]>;
    getPushKey: (path: string) => Promise<string>;
    getRecord: <T = any>(path: string, idProp?: string) => Promise<T>;
    getValue: <T = any>(path: string) => Promise<T | void>;
    update: <T = any>(path: string, value: Partial<T>) => Promise<void>;
    set: <T = any>(path: string, value: T) => Promise<void>;
    remove: (path: string, ignoreMissing?: boolean) => Promise<any>;
    watch: (target: string | ISerializedQuery, events: IAbstractedEvent | IAbstractedEvent[], cb: any) => void;
    unWatch: (events?: IAbstractedEvent | IAbstractedEvent[], cb?: any) => void;
}
export interface IAppInfo {
    name: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
}
