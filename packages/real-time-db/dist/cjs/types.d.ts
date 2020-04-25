import { DataSnapshot, OnDisconnect, Query, ThenableReference, EventType } from '@firebase/database-types';
import { IDictionary } from 'common-types';
import { IFirebaseClientConfig, IFirebaseAdminConfig } from '.';
import { RealTimeDb } from './RealTimeDb';
export declare type IMockLoadingState = 'not-applicable' | 'loaded' | 'loading' | 'timed-out';
export declare type DebuggingCallback = (message: string) => void;
export declare type IFirebaseConfig = IFirebaseClientConfig | IFirebaseAdminConfig;
export interface IFirebaseListener {
    id: string;
    cb: IFirebaseConnectionCallback;
    ctx?: IDictionary;
}
export declare type IFirebaseConnectionCallback = (db: RealTimeDb, ctx?: IDictionary) => void;
export interface IEmitter {
    emit: (event: string | symbol, ...args: any[]) => boolean;
    on: (event: string, value: any) => any;
    once: (event: string, value: any) => any;
}
export interface IClientEmitter extends IEmitter {
    connection: (state: boolean) => void;
}
export interface IAdminEmitter extends IEmitter {
    connection: undefined;
}
export interface IPathSetter<T = any> {
    path: string;
    value: T;
}
export interface IMultiPathSet extends IDictionary {
    /**
     * **paths**
     *
     * the _relative_ paths from the base which will be updated upon execution
     */
    paths: string[];
    /**
     * the _absolute_ paths (including the base offset) which will be updated
     * upon execution
     */
    fullPaths: string[];
    /**
     * **payload**
     *
     * Returns a name/value pairing of database paths as the **keys** and the value
     * to be set at those paths as the **value**. This is what will be passed to
     * Firebase's `update()` operation when this API's `execute()` function is
     * called.
     */
    payload: Array<IPathSetter<any>>;
    findPathItem(path: string): string;
    /**
     * **callback**
     *
     * Allows adding a callback which is executed on conclusion of the set attempt
     */
    callback(cb: (err: any, pathSetters: IPathSetter[]) => void): IMultiPathSet;
    /**
     * **basePath**
     *
     * Sets the base path which all paths are rooted from
     */
    basePath(path?: string): IMultiPathSet;
    /**
     * **add**
     *
     * Add in a new _path_ and _value_ to be included in the operation.
     * Note that the _path_ will be an "offset" from the base path which
     * was set with the call to _multiPathSet()_ (or _mps()_ if using in
     * FireModel)
     */
    add<T = any>(pathValue: IPathSetter<T>): IMultiPathSet;
    /**
     * **execute**
     *
     * Sends the `payload()` to Firebase using Firebase's
     * multi-path `update()` operation.
     */
    execute(): Promise<void>;
}
export declare type IFirebaseWatchEvent = IValueBasedWatchEvent | IPathBasedWatchEvent;
export interface IFirebaseWatchContext {
    eventType: EventType;
    targetType: any;
    /**
     * this tagging has been added as optional to not break prior API but all
     * server events will set this variable so that when it is received by **Firemodel**
     * it can distiguish local versus server triggered events.
     */
    kind?: 'server-event';
}
/** A standard watch event coming from the Firebase DB */
export interface IValueBasedWatchEvent extends IFirebaseWatchContext {
    targetType: 'query';
    key: string;
    value: any;
    previousChildKey?: string;
}
/**
 * an event which states an array of paths which have changes rather than
 * a singular value object; this happens typically when the event is originated
 * from Firemodel (aka, not Firebase) but can happen also when abstracted-firebase
 * writes to the DB using a "multi-path set" operation.
 */
export interface IPathBasedWatchEvent extends IFirebaseWatchContext {
    targetType: 'path';
    key: string;
    paths: IPathSetter[];
}
/**
 * a function/callback which receives an event whenever the "watch"
 * detects a change
 */
export declare type IFirebaseWatchHandler = (event: IFirebaseWatchEvent) => any;
export declare enum FirebaseBoolean {
    true = 1,
    false = 0
}
export interface IReference<T = any> extends Query {
    readonly key: string | null;
    readonly parent: IReference | null;
    readonly root: IReference;
    /** Writes data to a Database location */
    set(newVal: T, onComplete?: (a: Error | null) => void): Promise<void>;
    /** Write/update 1:M values to the Database, if you need to update multiple paths in DB then the keys must be deep paths notated by slash-notation */
    update(objectToMerge: Partial<T> | IDictionary<Partial<T>>, onComplete?: (a: Error | null) => void): Promise<void>;
    /** Like set() but also specifies the priority for that data */
    setWithPriority(newVal: T, newPriority: string | number | null, onComplete?: (a: Error | null) => void): Promise<any>;
    /** Removes the data at this Database location. Any data at child locations will also be deleted. */
    remove(onComplete?: (a: Error | null) => void): Promise<void>;
    /** Atomically modifies the data at this location */
    transaction(transactionUpdate: (a: Partial<T>) => any, onComplete?: (a: Error | null, b: boolean, c: DataSnapshot | null) => any, applyLocally?: boolean): Promise<ITransactionResult<T>>;
    /** Sets a priority for the data at this Database location. */
    setPriority(priority: string | number | null, onComplete?: (a: Error | null) => void): Promise<void>;
    /** Generates a new child location using a unique key and returns a Reference. */
    push(value?: any, onComplete?: (a: Error | null) => void): ThenableReference;
    /** Returns an OnDisconnect object - see Enabling Offline Capabilities in JavaScript for more information on how to use it. */
    onDisconnect(): OnDisconnect;
}
export interface ITransactionResult<T = any> {
    committed: boolean;
    snapshot: DataSnapshot;
    toJSON?: () => IDictionary;
}
