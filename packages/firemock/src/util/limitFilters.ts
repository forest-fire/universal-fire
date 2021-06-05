/* eslint-disable @typescript-eslint/no-unsafe-return */
//@ts-ignore
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';

/** an filter function for queries with a `limitToFirst` value */
export function limitToFirst(query: SerializedRealTimeQuery) {
  const value = query.identity.limitToFirst;

  return (list: any[]) => {
    if (value === undefined) {
      return list;
    }

    return list.slice(0, value);
  };
}

/** an filter function for queries with a `limitToLast` value */
export function limitToLast(query: SerializedRealTimeQuery) {
  const value = query.identity.limitToLast;

  return (list: any[]) => {
    if (value === undefined) {
      return list;
    }

    return list.slice(-1 * value);
  };
}
