/* eslint-disable @typescript-eslint/no-explicit-any */
import * as limitFilters from './limitFilters';
import * as queryFilters from './queryFilters';
import * as sortFns from './sortFns';
import { keys } from 'native-dash';

import { arrayToHash, hashToArray } from 'typed-conversions';

import { IDictionary } from 'common-types';
import { RtdbOrder, IRtdbSdk, ISerializedQuery } from '@forest-fire/types';
import { SortOrder } from '../@types/query-types';

const orderByKey = (list: IDictionary) => {
  const keys = Object.keys(list).sort();
  const hash: IDictionary = {};
  keys.forEach((k) => {
    hash[k] = list[k];
  });
  return hash;
};

const orderByValue = <T extends IDictionary>(
  list: T,
  direction = SortOrder.asc
): T => {
  const values = hashToArray(list).sort((a, b) =>
    a.value > b.value
      ? direction === SortOrder.asc
        ? 1
        : -1
      : direction === SortOrder.asc
        ? -1
        : 1
  );

  return values.reduce((agg: IDictionary, curr) => {
    agg[curr.id] = curr.value;
    return agg;
  }, {}) as T;
};

const sortFn: (query: any) => sortFns.ISortFns = (query) =>
  query.identity.orderBy === RtdbOrder.orderByChild
    ? sortFns.orderByChild(query.identity.orderByKey)
    : (sortFns[
      query.identity.orderBy as keyof typeof sortFns
    ] as sortFns.ISortFns);

export function runQuery<
  T extends ISerializedQuery<TSdk>,
  TSdk extends IRtdbSdk,
  D extends IDictionary<any> | any[]
>(query: T, data: D): any {
  /**
   * A boolean _flag_ to indicate whether the path is of the query points to a Dictionary
   * of Objects. This is indicative of a **Firemodel** list node.
   */
  const isListOfObjects =
    typeof data === 'object' &&
    Object.keys(data).every(
      (i) => typeof data[i as keyof typeof data] === 'object'
    );
  const dataIsAScalar = ['string', 'boolean', 'number'].includes(typeof data);

  if (dataIsAScalar) {
    return data;
  }

  const dataIsAnObject = !Array.isArray(data) && typeof data === 'object';

  if (dataIsAnObject && !isListOfObjects) {
    data =
      query.identity.orderBy === 'orderByKey'
        ? (orderByKey(data) as D)
        : orderByValue(data);
    // allows non-array data that can come from a 'value' listener
    // to pass through at this point
    const limitToKeys = query.identity.limitToFirst
      ? Object.keys(data).slice(0, query.identity.limitToFirst)
      : query.identity.limitToLast
        ? Object.keys(data).slice(-1 * query.identity.limitToLast)
        : false;

    if (limitToKeys) {
      keys(data).forEach((k) => {
        if (!limitToKeys.includes(k as string)) {
          delete data[k];
        }
      });
    }

    return data;
  }

  const dataList = isListOfObjects || dataIsAnObject ? hashToArray(data) : data;

  if (!dataList) {
    return undefined;
  }

  const limitFilter = _limitFilter<TSdk>(query);
  const queryFilter = _queryFilter<TSdk>(query);

  const list = limitFilter(queryFilter(dataList.sort(sortFn(query)))) as any[];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return isListOfObjects
    ? // this is list of records to convert back to hash for Firebase compatability
    arrayToHash(list)
    : dataIsAnObject
      ? // if it was an Object but values weren't objects then this is probably
      // a key/value pairing
      list.reduce((agg: IDictionary, curr: IDictionary<any>) => {
        if (curr.id && curr.value) {
          // definitely looks like a id/value pairing
          agg[curr.id] = curr.value;
        } else if (curr.id) {
          // has an ID so offset using the id but use the remainder of the hash
          // as the value
          const hash = { ...curr };
          delete hash.id;
          agg[curr.id] = hash;
        } else {
          console.log({
            message: `Unsure what to do with part of a data structure resulting from the the query: ${JSON.stringify(
              query.identity
            )}.\n\nThe item in question was: "${JSON.stringify(curr)}".`,
            severity: 0,
          });
        }

        return agg;
      }, {})
      : list;
}

function _limitFilter<TSdk extends IRtdbSdk>(query: ISerializedQuery<TSdk>) {
  const first = limitFilters.limitToFirst(query);
  const last = limitFilters.limitToLast(query);

  return (list: unknown[]) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return first(last(list));
  };
}

function _queryFilter<TSdk extends IRtdbSdk>(query: ISerializedQuery<TSdk>) {
  return (list: unknown[]) => {
    return list
      .filter(queryFilters.equalTo(query))
      .filter(queryFilters.startAt(query))
      .filter(queryFilters.endAt(query));
  };
}
