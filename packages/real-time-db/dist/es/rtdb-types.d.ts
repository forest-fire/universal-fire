import type { IDictionary } from 'common-types';
import type { RealTimeDb } from './index';
import type { AbstractedDatabase } from '@forest-fire/abstracted-database';
import type { IRtdbReference, IRtdbDataSnapshot, IRtdbOnDisconnect, IRtdbThenableReference, IFirebaseWatchContext, IPathSetter } from '@forest-fire/types';
export declare type IMockLoadingState = 'not-applicable' | 'loaded' | 'loading' | 'timed-out';
export declare type DebuggingCallback = (message: string) => void;
export interface IFirebaseListener {
    id: string;
    cb: IFirebaseConnectionCallback;
    ctx?: IDictionary;
}
export declare type IFirebaseConnectionCallback = (db: IRealTimeDb, ctx?: IDictionary) => void;
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
export declare type IFirebaseWatchEvent = IValueBasedWatchEvent | IPathBasedWatchEvent;
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
export interface IReference<T = any> extends IRtdbReference {
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
    transaction(transactionUpdate: (a: Partial<T>) => any, onComplete?: (a: Error | null, b: boolean, c: IRtdbDataSnapshot | null) => any, applyLocally?: boolean): Promise<ITransactionResult<T>>;
    /** Sets a priority for the data at this Database location. */
    setPriority(priority: string | number | null, onComplete?: (a: Error | null) => void): Promise<void>;
    /** Generates a new child location using a unique key and returns a Reference. */
    push(value?: any, onComplete?: (a: Error | null) => void): IRtdbThenableReference;
    /** Returns an OnDisconnect object - see Enabling Offline Capabilities in JavaScript for more information on how to use it. */
    onDisconnect(): IRtdbOnDisconnect;
}
export interface ITransactionResult<T = any> {
    committed: boolean;
    snapshot: IRtdbDataSnapshot;
    toJSON?: () => IDictionary;
}
/**
 * Because Typescript can't type a _chain_ of dependencies (aka., A => B => C),
 * we have created this type represents the full typing of `RealTimeDb`
 */
export declare type IRealTimeDb = RealTimeDb & AbstractedDatabase;
