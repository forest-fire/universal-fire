import { IRtdbSdk, ISerializedQuery } from '@forest-fire/types';
import { QueryFunction } from '~/@types';

export function startAt<TSdk extends IRtdbSdk, TData extends unknown = Record<string, unknown>>(query: ISerializedQuery<TSdk, TData>): QueryFunction {
  const key = query.identity.startAtKey || query.identity.orderByKey;
  const value = query.identity.startAt;

  return (record) => {
    if (value === undefined) {
      return true;
    }

    return key ? record[key as keyof typeof record] >= value : record >= value;
  };
}

export function endAt<TSdk extends IRtdbSdk, TData extends unknown = Record<string, unknown>>(query: ISerializedQuery<TSdk, TData>): QueryFunction {
  const key = query.identity.endAtKey || query.identity.orderByKey;
  const value = query.identity.endAt;

  return (record) => {
    if (value === undefined) {
      return true;
    }

    return key ? record[key as keyof typeof record] <= value : record <= value;
  };
}

/** a filter function for queries with a `equalTo` value */
export function equalTo<TSdk extends IRtdbSdk, TData extends unknown = Record<string, unknown>>(query: ISerializedQuery<TSdk, TData>): QueryFunction {
  const key = query.identity.equalToKey || query.identity.orderByKey;
  const value = query.identity.equalTo;

  return (record) => {
    if (value === undefined) {
      return true;
    }

    return key ? record[key as keyof typeof record] === value : record === value;
  };
}
