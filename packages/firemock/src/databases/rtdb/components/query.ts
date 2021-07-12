import {
  IMockStore,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
  IRtdbQuery,
  IRtdbSdk,
  ISerializedQuery,
  RtdbOrder,
} from '@forest-fire/types';
import { leafNode, runQuery } from '../../..';
import { reference } from './reference';
import { snapshot } from './snapshot';

export type IRtdbMockQueryFactory<TSdk extends IRtdbSdk> = (
  store: IMockStore<TSdk>,
  query: ISerializedQuery<TSdk>
) => IRtdbQuery;

export const query: IRtdbMockQueryFactory<IRtdbSdk> = (store, serializedQuery) => {
  const partialQuery: IRtdbQuery = {
    endBefore: (_value, _key) => {
      throw new Error('not implemented');
    },
    startAfter: (_value, _key) => {
      throw new Error('not implemented');
    },
    get: async () => {
      await store.networkDelay();
      const data = store.getDb(serializedQuery.path);
      const results = runQuery(serializedQuery, data);

      // TODO: See how this was implemented before
      return snapshot(store, leafNode(serializedQuery.path), results ? results : null);
    },
    endAt: (value, key) => {
      serializedQuery.endAt(value, key);
      return this;
    },
    equalTo: (value, key) => {
      serializedQuery.equalTo(value, key);
      if (key && serializedQuery.identity.orderBy === RtdbOrder.orderByKey) {
        throw new Error(
          `You can not use "equalTo(val, key)" with a "key" property defined when using a key sort!`
        );
      }
      serializedQuery.equalTo(value, key);

      return this;
    },
    isEqual: (other: IRtdbQuery & { _query: ISerializedQuery<IRtdbSdk> }) => {
      return serializedQuery.hashCode() === other._query.hashCode();
    },
    limitToFirst: (limit: number) => {
      serializedQuery.limitToFirst(limit);
      return this;
    },
    limitToLast: (limit: number) => {
      serializedQuery.limitToLast(limit);
      return this;
    },
    off: (
      _eventType?: IRtdbDbEvent,
      _callback?: (a: IRtdbDataSnapshot, b?: null | string) => any
    ) => {
      console.log('off() not implemented yet on Firemock');
    },
    on: (
      eventType: IRtdbDbEvent,
      callback: (a: IRtdbDataSnapshot, b?: null | string) => any,
      cancelCallbackOrContext?: (err?: Error) => void | null,
      context?: Record<string, unknown> | null
    ): ((a: IRtdbDataSnapshot, b?: null | string) => unknown) => {
      store.addListener(
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
      // console.warn("once", { path: serializedQuery.path, data})

      const results = runQuery(serializedQuery, data);

      // TODO: See how this was implemented before
      return snapshot(store, leafNode(serializedQuery.path), results ? results : null);
    },
    orderByChild: (prop: string) => {
      serializedQuery.orderByChild(prop);
      return this;
    },
    orderByKey: () => {
      serializedQuery.orderByKey();
      return this;
    },
    orderByPriority: () => {
      // TODO: should we implement? this idea of Priority is code smell these days
      // _query.order();
      return this;
    },
    orderByValue: () => {
      serializedQuery.orderByValue();
      return this;
    },
    get ref() {
      return reference(store, serializedQuery)
    },
    startAt: (value) => {
      serializedQuery.startAt(value);
      return this;
    },
    toJSON: () => ({
      url: reference(store, serializedQuery).toString(),
      dbConfig: store.config,
    }),
  };

  return partialQuery;
};
