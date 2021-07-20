/* eslint-disable @typescript-eslint/no-unsafe-return */

import { IRtdbSdk, ISerializedQuery } from '@forest-fire/types';

/** an filter function for queries with a `limitToFirst` value */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function limitToFirst<TSdk extends IRtdbSdk, TData extends unknown = Record<string, unknown>>(query: ISerializedQuery<TSdk, TData>) {
  const value = query.identity.limitToFirst;

  return <D>(list: D[]) => {
    if (value === undefined) {
      return list;
    }

    return list.slice(0, value);
  };
}

/** an filter function for queries with a `limitToLast` value */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function limitToLast<TSdk extends IRtdbSdk, TData extends unknown = Record<string, unknown>>(query: ISerializedQuery<TSdk, TData>) {
  const value = query.identity.limitToLast;

  return <T>(list: T[]) => {
    if (value === undefined) {
      return list;
    }

    return list.slice(-1 * value);
  };
}
