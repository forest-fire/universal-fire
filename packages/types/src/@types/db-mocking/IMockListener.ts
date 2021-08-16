import { timestring } from 'common-types';
import { ISerializedQuery } from '../query';
import { ISdk } from '../fire-types';
import { EventFrom, SnapshotFrom } from '../database';

export interface IMockListener<
  TSdk extends ISdk,
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
  eventType: EventFrom<TSdk>;
  /**
   * The callback which will be called if the `query` has the record/path "in scope"
   * and the `eventType` matches.
   */
  callback: <T = unknown>(snap: SnapshotFrom<TSdk>, b?: null | string) => T;
  /**
   * Conditionally cancel the callback with _another_ callback function that responds to errors
   */
  cancelCallbackOrContext?: (err?: Error & { code: string }) => void | null;
  /**
   * Provide any additional context needed to the primary event callback
   */
  context?: Record<string, unknown> | null;
}
