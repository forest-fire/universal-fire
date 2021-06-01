import { timestring } from 'common-types';
import {
  IFirestoreDbEvent,
  IFirestoreQuerySnapshot,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
} from '../fire-proxies';
import { ISerializedQuery } from '../serialized-query';

export interface IMockListener<
  TEvent extends IRtdbDbEvent | IFirestoreDbEvent,
  TSnap extends IRtdbDataSnapshot | IFirestoreQuerySnapshot
> {
  /** string uniquely identifying the listener */
  id: string;
  /** a timestamp indicating when listener was created */
  timestamp: timestring;
  /** the _query_ the listener is based off of */
  query: ISerializedQuery;
  /**
   * The event type -- which is specific the database type -- which this listener
   * will respond to.
   */
  eventType: TEvent;
  /**
   * The callback which will be called if the `query` has the record/path "in scope"
   * and the `eventType` matches.
   */
  callback: (snap: TSnap, b?: null | string) => any;
  /**
   * Conditionally cancel the callback with _another_ callback function that responds to errors
   */
  cancelCallbackOrContext?: (err?: Error & { code: string }) => void | null;
  /**
   * Provide any additional context needed to the primary event callback
   */
  context?: object | null;
}
