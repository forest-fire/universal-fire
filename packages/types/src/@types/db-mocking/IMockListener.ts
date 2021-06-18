import { timestring } from 'common-types';
import { ISerializedQuery } from '../query';
import { IFirestoreDbEvent, IRtdbDbEvent } from '../fire-proxies';
import { IFirestoreSnapshot, IRtdbDataSnapshot, ISnapshot } from '../snapshot';
import { Database, IDb, ISdk, SDK } from '../fire-types';

export interface IMockListener<
  TSdk extends ISdk,
  TDb extends IDb = TSdk extends SDK.FirestoreAdmin | SDK.FirestoreClient ? Database.Firestore : Database.RTDB,
  TEvent extends IRtdbDbEvent | IFirestoreDbEvent = TDb extends "RTDB" ? IRtdbDbEvent : IFirestoreDbEvent,
  TSnap extends ISnapshot = TDb extends "RTDB" ? IRtdbDataSnapshot : IFirestoreSnapshot
  > {
  /** string uniquely identifying the listener */
  id: string;
  /** a timestamp indicating when listener was created */
  timestamp: timestring;
  /** the _query_ the listener is based off of */
  query: ISerializedQuery<TSdk>;
  /**
   * The event type -- which is specific the database type -- which this listener
   * will respond to.
   */
  eventType: TEvent;
  /**
   * The callback which will be called if the `query` has the record/path "in scope"
   * and the `eventType` matches.
   */
  callback: <T = unknown>(snap: TSnap, b?: null | string) => T;
  /**
   * Conditionally cancel the callback with _another_ callback function that responds to errors
   */
  cancelCallbackOrContext?: (err?: Error & { code: string }) => void | null;
  /**
   * Provide any additional context needed to the primary event callback
   */
  context?: Record<string, unknown> | null;
}
