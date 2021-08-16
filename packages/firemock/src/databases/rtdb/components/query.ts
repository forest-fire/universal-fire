/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  EventFrom,
  IMockStore,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
  IRtdbQuery,
  IRtdbSdk,
  ISerializedQuery,
  RtdbOrder,
} from '@forest-fire/types';
import { leafNode } from '~/util';
import { runQuery } from '../util/runQuery';
import { reference } from './reference';
import { snapshot } from './snapshot';

export const query = <
  TSdk extends IRtdbSdk,
  TData extends unknown = Record<string, unknown>
>(
  store: IMockStore<TSdk, TData>,
  serializedQuery: ISerializedQuery<TSdk, TData>
): IRtdbQuery => {
  const partialQuery: IRtdbQuery = {
    // get: async () => {
    //   await store.networkDelay();
    //   const data = store.getDb<TData>(serializedQuery.path);
    //   const results = runQuery(serializedQuery, data as TData);

    //   // TODO: See how this was implemented before
    //   return snapshot(
    //     store,
    //     leafNode(serializedQuery.path),
    //     results ? results : null
    //   );
    // },
    endAt: (value, key) => {
      serializedQuery.endAt(value, key as string & keyof TData);
      return query(store, serializedQuery);
    },
    equalTo: (value, key) => {
      if (key && serializedQuery.identity.orderBy === RtdbOrder.orderByKey) {
        throw new Error(
          `You can not use "equalTo(val, key)" with a "key" property defined when using a key sort!`
        );
      }
      serializedQuery.equalTo(value, key as string & keyof TData);

      return query(store, serializedQuery);
    },
    isEqual: (other: IRtdbQuery & { _query: ISerializedQuery<IRtdbSdk> }) => {
      return serializedQuery.hashCode() === other._query.hashCode();
    },
    limitToFirst: (limit: number) => {
      serializedQuery.limitToFirst(limit);
      return query(store, serializedQuery);
    },
    limitToLast: (limit: number) => {
      serializedQuery.limitToLast(limit);
      return query(store, serializedQuery);
    },
    off: (
      _eventType?: IRtdbDbEvent,
      _callback?: (a: IRtdbDataSnapshot, b?: null | string) => any
    ) => {
      console.log('off() not implemented yet on Firemock');
    },
    on: (
      eventType: EventFrom<TSdk>,
      callback: (a: IRtdbDataSnapshot, b?: null | string) => any,
      cancelCallbackOrContext?: (err?: Error) => void | null,
      context?: Record<string, unknown> | null
    ): ((a: IRtdbDataSnapshot, b?: null | string) => unknown) => {
      store.addListener<TData>(
        serializedQuery,
        eventType,
        callback,
        cancelCallbackOrContext,
        context
      );
      return callback;
    },
    once: async (_eventType: 'value'): Promise<IRtdbDataSnapshot> => {
      await store.networkDelay();

      const data = store.getDb(serializedQuery.path);
      const results = runQuery(serializedQuery, data);
      console.log(serializedQuery, results);
      // TODO: See how this was implemented before
      return snapshot(
        store,
        leafNode(serializedQuery.path),
        results ? results : null
      );
    },
    orderByChild: (prop: string & keyof TData) => {
      serializedQuery.orderByChild(prop);
      return query(store, serializedQuery);
    },
    orderByKey: () => {
      serializedQuery.orderByKey();
      return query(store, serializedQuery);
    },
    orderByPriority: () => {
      // TODO: should we implement? this idea of Priority is code smell these days
      // _query.order();
      return query(store, serializedQuery);
    },
    orderByValue: () => {
      serializedQuery.orderByValue();
      return query(store, serializedQuery);
    },
    get ref() {
      return reference(store, serializedQuery);
    },
    startAt: (value, key) => {
      serializedQuery.startAt(value, key as string & keyof TData);
      return query(store, serializedQuery);
    },
    toJSON: () => ({
      url: reference(store, serializedQuery).toString(),
      dbConfig: store.config,
    }),
  };

  return partialQuery;
};
