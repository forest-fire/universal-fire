import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import type {
  IRtdbDbEvent,
  IRtdbDataSnapshot,
  SnapshotFrom,
  ISdk,
} from '@forest-fire/types';
import { EventFrom, IRtdbSdk } from '@forest-fire/types';


/**
 * Captures a CRUD event
 */
export interface IMockWatcherGroupEvent<TSdk extends ISdk> {
  /** the unique identifier of the listener */
  listenerId: string;
  /** the path that the listener is listening at */
  listenerPath: string;
  /** the event which is being listened to */
  listenerEvent: EventFrom<TSdk>;
  /** the dispatch function for this listener */
  callback: IFirebaseEventHandler<TSdk>;
  /** the path where the event took place */
  eventPaths: string[];
  /** the "key" of the event; this applied to value AND child events */
  key: string;
  /** changes between value and priorValue */
  changes: unknown;
  /** the new value which has been set */
  value: unknown;
  /** the prior value that this property held previous to the event */
  priorValue: unknown;
}

/**
 * A change event which is fired from Firebase; the specific signature
 * of the event depends on the event type being fired.
 *
 * events: [API Spec](https://firebase.google.com/docs/reference/node/firebase.database.Reference#on)
 *
 * @param snap the DBRtdbDataSnapshot which provides access to the root of the `on` event;
 * in the case of a _removal_ you will get snapshot of the prior value
 * @param prevChildKey provided on `child_changed`, `child_moved`, and `child_added`; gives the
 * name of the key which directly _preceeds_ the event key in Firebase's stored order
 */
export interface IFirebaseEventHandler<TSdk extends ISdk> {
  (snap: SnapshotFrom<TSdk>, prevChildKey?: string): void;
}

export type EventHandler =
  | HandleValueEvent
  | HandleNewEvent
  | HandleRemoveEvent;
export type GenericEventHandler = (
  snap: IRtdbDataSnapshot,
  key?: string
) => void;
export type HandleValueEvent = (dataSnapShot: IRtdbDataSnapshot) => void;
export type HandleNewEvent = (
  childSnapshot: IRtdbDataSnapshot,
  prevChildKey: string
) => void;
export type HandleRemoveEvent = (oldChildSnapshot: IRtdbDataSnapshot) => void;
export type HandleMoveEvent = (
  childSnapshot: IRtdbDataSnapshot,
  prevChildKey: string
) => void;
export type HandleChangeEvent = (
  childSnapshot: IRtdbDataSnapshot,
  prevChildKey: string
) => void;

export interface IListener<TSdk extends IRtdbSdk> {
  /** random string */
  id: string;
  /** the _query_ the listener is based off of */
  query: SerializedRealTimeQuery<TSdk>;

  eventType: EventFrom<TSdk>;
  callback: (a: SnapshotFrom<TSdk> | null, b?: string) => any;
  cancelCallbackOrContext?: Record<string, unknown> | null;
  context?: Record<string, unknown> | null;
}
