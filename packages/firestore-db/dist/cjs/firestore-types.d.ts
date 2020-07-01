import type { FirestoreDb } from './index';
import type { AbstractedDatabase } from '@forest-fire/abstracted-database';
import { IFirestoreDbEvent, IAbstractedEvent } from '@forest-fire/types';
export declare const VALID_FIRESTORE_EVENTS: string[];
/**
 * Because Typescript can't type a _chain_ of dependencies (aka., A => B => C),
 * we have created this type represents the full typing of `RealTimeDb`
 */
export declare type IFirestoreDb = FirestoreDb & AbstractedDatabase;
/**
 * Validates that all events passed in are valid events for
 * the **Firestore** database.
 *
 * @param events the event or events which are being tested
 */
export declare function isFirestoreEvent(events: IAbstractedEvent | IAbstractedEvent[]): events is IFirestoreDbEvent | IFirestoreDbEvent[];
