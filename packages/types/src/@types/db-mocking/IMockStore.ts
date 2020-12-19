import { IDictionary } from 'common-types';
import { IDatabaseConfig } from '../index';
import {
  IFirestoreDbEvent,
  IFirestoreQuerySnapshot,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
} from '../fire-proxies';
import { ApiKind, Database } from '../fire-types';
import { ISerializedQuery } from '../serialized-query';
import { IMockListener } from './IMockListener';
import { NetworkDelay } from './index';
import { DataSnapshot, EventType } from '@firebase/database-types';
import { QuerySnapshot } from '@firebase/firestore-types';

export interface IMockStore<TState extends IDictionary> {
  /** the API exposed by the underlying SDK (e.g., admin, client, rest) which is being used */
  api: ApiKind;
  /** the underlying DB technology (e.g., RTDB, Firestore) */
  db: Database;

  /**
   * The in-memory state tree representing the mock database's state
   */
  state: TState;

  /**
   * The configuration object used by consumer when using `universal-fire`
   */
  config: IDatabaseConfig;

  /**
   * FUTURE: to hold the database rules, if they are provided
   */
  rules?: IDictionary;

  /**
   * Adds a listener to the mock database based on a specified
   * event type.
   */
  addListener<
    TEvent extends IRtdbDbEvent | IFirestoreDbEvent,
    TSnap extends IRtdbDataSnapshot | IFirestoreQuerySnapshot
  >(
    /**
     * The query being used to represent the watcher.
     *
     * Note: all watchers/listeners in the mock DB are represented as
     * queries even if they're just a string path. This just simplifies
     * the interface somewhat.
     */
    query: ISerializedQuery,
    /**
     * The event type which this listener will respond to.
     */
    eventType: TEvent,
    //TODO: make this generalized across RTDB and Firestore
    /**
     * A callback which is called when a change is detected on the passed in `query`
     * and the `eventType` matches.
     */
    callback: (snap: TSnap, b?: null | string) => unknown,
    /**
     * conditionally cancel the callback with _another_ callback function that responds to errors
     */
    cancelCallback?: (err?: Error & { code: string }) => void | null,
    /**
     * optionally provide any additional context needed to the primary event callback
     */
    context?: Record<string, unknown> | null
  ): IMockListener<TEvent, TSnap>;

  /**
   * removes a "watcher" from the mock database
   */
  removeListener(id: string): void;

  /** lists all the watchers currently operating on the mock database */
  getAllListeners(): IMockListener<EventType, DataSnapshot | QuerySnapshot>[];

  /**
   * Sets the network delay characteristics to be used for DB functions
   */
  setNetworkDelay(delay: NetworkDelay | number | [number, number]): void;

  /** produces a network delay based on configured settings for Database service */
  networkDelay(): Promise<void>;

  /**
   * silences the database from sending events;
   * this is not typically done but can be done
   * as part of the Mocking process to reduce noise
   */
  silenceEvents: () => void;
  /**
   * returns the database to its default state of sending
   * events out.
   */
  restoreEvents: () => void;
  /**
   * A boolean flag indicating whether the store should send
   * _dispatch_ events at the current moment.
   */
  shouldSendEvents: () => boolean;

  /** clears the mock DB's state without losing reference to DB object */
  clearDb: () => void;

  /**
   * Get the state at a given path in the mock database's state tree
   */
  getDb<T extends IDictionary = IDictionary>(path?: string): T;
  /**
   * Sets the state at a given path of the Mock DB's state tree
   */
  setDb(path: string, value: unknown, silent?: boolean): void;
  /**
   * replaces passed in properties while maintaining untouched properties.
   * This is half-way between the "set" and "merge" operations in that it is
   * non-destructive to props unchanged but it _sets_ the new value in replace
   * of the old where new props are provided.
   */
  updateDb<T extends IDictionary = IDictionary>(path: string, value: T): void;
  /**
   * merges the passed in value with the existing state non-destructively
   */
  mergeDb<T extends IDictionary = IDictionary>(path: string, value: T): void;
  /**
   * **multiPathUpdate**
   *
   * Emulates a Firebase multi-path update. The keys of the dictionary
   * are _paths_ in the DB, the value is the value to set at that path.
   *
   * **Note:** dispatch notifations must not be done at _path_ level but
   * instead grouped up by _watcher_ level.
   */
  multiPathUpdate(data: IDictionary): void;

  /** removes/prunes a path in the mock DB's state tree */
  removeDb(path: string): void;
  /**
   * **pushDb**
   *
   * Push a new record into the mock database. Uses the
   * `firebase-key` library to generate the key which
   * attempts to use the same algorithm as Firebase
   * itself.
   */
  pushDb(path: string, value: unknown): string;
  /** Clears the DB and removes all listeners */
  reset(): void;
}
