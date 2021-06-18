/* eslint-disable @typescript-eslint/no-unsafe-return */

import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { IRtdbSdk } from '@forest-fire/types/src';

/** an filter function for queries with a `limitToFirst` value */
export function limitToFirst<T extends SerializedRealTimeQuery<TSdk>, TSdk extends IRtdbSdk>(query: T): any {
  const value = query.identity.limitToFirst;

  return (list: any[]) => {
    if (value === undefined) {
      return list;
    }

    return list.slice(0, value);
  };
}

/** an filter function for queries with a `limitToLast` value */
export function limitToLast<T extends SerializedRealTimeQuery<TSdk>, TSdk extends IRtdbSdk>(query: T): any {
  const value = query.identity.limitToLast;

  return (list: any[]) => {
    if (value === undefined) {
      return list;
    }

    return list.slice(-1 * value);
  };
}
