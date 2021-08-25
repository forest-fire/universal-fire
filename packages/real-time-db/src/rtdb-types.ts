import type { IDictionary } from 'common-types';
import type { RealTimeDb } from './index';
import type {
  IRtdbReference,
  IRtdbDataSnapshot,
  IRtdbOnDisconnect,
  IRtdbThenableReference,
  IFirebaseWatchContext,
  IPathSetter,
  IAbstractedEvent,
  IRtdbDbEvent,
  IRtdbSdk,
} from '@forest-fire/types';

export type IMockLoadingState =
  | 'not-applicable'
  | 'loaded'
  | 'loading'
  | 'timed-out';

export type DebuggingCallback = (message: string) => void;

export interface IFirebaseListener<TSdk extends IRtdbSdk> {
  id: string;
  cb: IFirebaseConnectionCallback<TSdk>;
  ctx?: IDictionary;
}

export type IFirebaseConnectionCallback<TSdk extends IRtdbSdk> = (
  db: IRealTimeDb<TSdk>,
  ctx?: IDictionary
) => void;

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

export type IFirebaseWatchEvent = IValueBasedWatchEvent | IPathBasedWatchEvent;

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
export type IFirebaseWatchHandler = (event: IFirebaseWatchEvent) => any;

export enum FirebaseBoolean {
  true = 1,
  false = 0,
}

export interface IReference<T = any> extends IRtdbReference {
  readonly key: string | null;
  readonly parent: IReference | null;
  readonly root: IReference;

  /** Writes data to a Database location */
  set(newVal: T, onComplete?: (a: Error | null) => void): Promise<void>;
  /** Write/update 1:M values to the Database, if you need to update multiple paths in DB then the keys must be deep paths notated by slash-notation */
  update(
    objectToMerge: Partial<T> | IDictionary<Partial<T>>,
    onComplete?: (a: Error | null) => void
  ): Promise<void>;
  /** Like set() but also specifies the priority for that data */
  setWithPriority(
    newVal: T,
    newPriority: string | number | null,
    onComplete?: (a: Error | null) => void
  ): Promise<any>;
  /** Removes the data at this Database location. Any data at child locations will also be deleted. */
  remove(onComplete?: (a: Error | null) => void): Promise<void>;
  /** Atomically modifies the data at this location */
  transaction(
    transactionUpdate: (a: Partial<T>) => any,
    onComplete?: (
      a: Error | null,
      b: boolean,
      c: IRtdbDataSnapshot | null
    ) => any,
    applyLocally?: boolean
  ): Promise<ITransactionResult>;
  /** Sets a priority for the data at this Database location. */
  setPriority(
    priority: string | number | null,
    onComplete?: (a: Error | null) => void
  ): Promise<void>;
  /** Generates a new child location using a unique key and returns a Reference. */
  push(
    value?: any,
    onComplete?: (a: Error | null) => void
  ): IRtdbThenableReference;
  /** Returns an OnDisconnect object - see Enabling Offline Capabilities in JavaScript for more information on how to use it. */
  onDisconnect(): IRtdbOnDisconnect;
}

export interface ITransactionResult {
  committed: boolean;
  snapshot: IRtdbDataSnapshot;
  toJSON?: () => IDictionary;
}

/**
 * Because Typescript can't type a _chain_ of dependencies (aka., A => B => C),
 * we have created this type represents the full typing of `RealTimeDb`
 */
export type IRealTimeDb<TSdk extends IRtdbSdk> = RealTimeDb<TSdk>;

export const VALID_REAL_TIME_EVENTS = [
  'value',
  'child_changed',
  'child_added',
  'child_removed',
  'child_moved',
];

/**
 * Validates that all events passed in are valid events for
 * the **Real Time** database.
 *
 * @param events the event or events which are being tested
 */
export function isRealTimeEvent(
  events: IAbstractedEvent | IAbstractedEvent[]
): events is IRtdbDbEvent | IRtdbDbEvent[] {
  const evts = Array.isArray(events) ? events : [events];

  return evts.every((e) => (VALID_REAL_TIME_EVENTS.includes(e) ? true : false));
}
