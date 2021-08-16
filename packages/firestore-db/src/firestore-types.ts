import type { FirestoreDb } from './index';
import {
  IFirestoreDbEvent,
  IAbstractedEvent,
  IDatabaseSdk,
  IFirestoreSdk,
} from '@forest-fire/types';

export const VALID_FIRESTORE_EVENTS = ['added', 'removed', 'modified'];

/**
 * Because Typescript can't type a _chain_ of dependencies (aka., A => B => C),
 * we have created this type represents the full typing of `RealTimeDb`
 */
export type IFirestoreDb<TSdk extends IFirestoreSdk> = FirestoreDb<TSdk> &
  IDatabaseSdk<IFirestoreSdk>;

/**
 * Validates that all events passed in are valid events for
 * the **Firestore** database.
 *
 * @param events the event or events which are being tested
 */

export function isFirestoreEvent(
  events: IAbstractedEvent | IAbstractedEvent[]
): events is IFirestoreDbEvent | IFirestoreDbEvent[] {
  const evts = Array.isArray(events) ? events : [events];

  return evts.every((e) => (VALID_FIRESTORE_EVENTS.includes(e) ? true : false));
}
