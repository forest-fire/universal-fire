import { DocumentData } from '@firebase/firestore-types';

/**
 * The explicit **Firebase** interface for the **RTDB** from the
 * `@firebase/database-types` library proxied through to be used in
 * **Universal Fire**.
 */
export type IFirebaseRtdbQuery = import('@firebase/database-types').Query;

export type IFirebaseFirestoreQuery<
  T = DocumentData
> = import('@firebase/firestore-types').Query<T>;

export type IComparisonOperator = '=' | '>' | '<';
