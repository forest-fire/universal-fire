import { IAdminAuth, IClientAuth } from '@forest-fire/types';
import { IDictionary } from 'native-dash';

export interface IRtdbMockStore<TState extends IDictionary = IDictionary> {
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
  shouldSendEvents: () => boolean;
  /** clears the mock DB's state without losing reference to DB object */
  clearDatabase: () => void;

  /**
   * The mocked Auth API appropriate for the SDK being used as
   * a container for the mock database.
   */
  auth(): Promise<IClientAuth | IAdminAuth>;
  /**
   * Get the state at a given path in the mock database's state tree
   */
  getDb<T = any>(path?: string): T;
  /**
   * Sets the state at a given path of the Mock DB's state tree
   */
  setDb(path: string, value: any, silent?: boolean): void;
  /**
   * merges a dictionary into the database's state at a given _path_ in the database
   * non-destructively
   */
  mergeDb<T extends IDictionary = IDictionary>(path: string, value: T): void;
  /**
   * replaces the database's at the given _path_ to a new value
   */
  updateDb<T = any>(path: string, value: T): void;
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
  pushDb(path: string, value: any): string;
  /** Clears the DB and removes all listeners */
  reset(): void;
}
