import { DocumentData } from '@firebase/firestore-types';
import { IRtdbDbEvent } from '../fire-proxies';

/**
 * The direct **Firebase** interface for the RTDB's **Query** from the
 * `@firebase/database-types` library proxied through to be used in
 * **Universal Fire**.
 */
export type IFirebaseRtdbQuery = import('@firebase/database-types').Query;

/**
 * The direct **Firebase** interface for the RTDB's **Reference** from the
 * `@firebase/database-types` library proxied through to be used in
 * **Universal Fire**.
 *
 * Note: a `Reference` is a superset of `Query`.
 */
export type IFirebaseRtdbReference = import('@firebase/database-types').Reference;

export type IFirebaseCollectionReference<
  T = DocumentData
> = import('@firebase/firestore-types').CollectionReference<T>;

/**
 * The direct **Firebase** interface for the Firestore's **Query** from the
 * `@firebase/database-types` library proxied through to be used in
 * **Universal Fire**.
 */
export type IFirebaseFirestoreQuery<
  T = DocumentData
> = import('@firebase/firestore-types').Query<T>;

export type IComparisonOperator = '=' | '>' | '<';

export type EventTypePlusChild = IRtdbDbEvent | 'child';
