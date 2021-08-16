import { IFirebaseFirestoreQuery, IFirebaseRtdbQuery } from './index';

/**
 * Provides a type guard, ensuring payload is a **Firestore** query
 */
export function isFirestoreQuery(
  query: Record<string, unknown> | IFirebaseRtdbQuery | IFirebaseFirestoreQuery
): query is IFirebaseRtdbQuery {
  // even though the orderByPriority is shit, it is a distinquishing
  // characteristic on RTDB not found elsewhere
  return (query as IFirebaseRtdbQuery).orderByPriority ? false : true;
}

/**
 * Provides a type guard, ensuring payload is a **Firestore** query
 */
export function isRealTimeQuery(
  query: Record<string, unknown> | IFirebaseRtdbQuery | IFirebaseFirestoreQuery
): query is IFirebaseRtdbQuery {
  // even though the orderByPriority is shit, it is a distinquishing
  // characteristic on RTDB not found elsewhere
  return (query as IFirebaseRtdbQuery).orderByPriority ? true : false;
}
