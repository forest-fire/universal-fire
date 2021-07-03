import {
  IMockStore,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
  IRtdbQuery,
  IRtdbReference,
  IRtdbSdk,
  ISdk,
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

export const query: IRtdbMockQueryFactory<IRtdbSdk> = (store, query) => {
  const ref = reference(store, query);
  query.hashCode;
  const q: IRtdbQuery = {
    endBefore: (_value, _key) => {
      throw new Error('not implemented');
    },
    startAfter: (_value, _key) => {
      throw new Error('not implemented');
    },
    get: async () => {
      await store.networkDelay();
      const data = store.getDb(query.path);
      const results = runQuery(query, data);

      // TODO: See how this was implemented before
      return snapshot(store, leafNode(query.path), results ? results : null);
    },
    endAt: (value, key) => {
      query.endAt(value, key);
      return q;
    },
    equalTo: (value, key) => {
      query.equalTo(value, key);
      if (key && query.identity.orderBy === RtdbOrder.orderByKey) {
        throw new Error(
          `You can not use "equalTo(val, key)" with a "key" property defined when using a key sort!`
        );
      }
      query.equalTo(value, key);

      return this;
    },
    isEqual: (other: IRtdbQuery & { _query: ISerializedQuery<IRtdbSdk> }) => {
      return query.hashCode() === other._query.hashCode();
    },
    limitToFirst: (limit: number) => {
      query.limitToFirst(limit);
      return q;
    },
    limitToLast: (limit: number) => {
      query.limitToLast(limit);
      return q;
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
        query,
        eventType,
        callback,
        cancelCallbackOrContext,
        context
      );
      return callback;
    },
    once: async (_eventType: 'value'): Promise<IRtdbDataSnapshot> => {
      await store.networkDelay();

      const data = store.getDb(query.path);
      const results = runQuery(query, data);

      // TODO: See how this was implemented before
      return snapshot(store, leafNode(query.path), results ? results : null);
    },
    orderByChild: (prop: string) => {
      query.orderByChild(prop);
      return q;
    },
    orderByKey: () => {
      query.orderByKey();
      return q;
    },
    orderByPriority: () => {
      // TODO: should we implement? this idea of Priority is code smell these days
      // _query.order();
      return q;
    },
    orderByValue: () => {
      query.orderByValue();
      return q;
    },
    ref,
    startAt: (value) => {
      query.startAt(value);
      return q;
    },
    toJSON: () => ({
      url: ref.toString(),
      dbConfig: store.config,
    }),
  };

  return { _query: query, ...q };
};
