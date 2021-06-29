import {
  IMockStore,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
  IRtdbQuery,
  IRtdbReference,
  ISdk,
  ISerializedQuery,
} from '@forest-fire/types';
import { leafNode, runQuery } from '../../..';
import { reference } from './reference';
import { snapshot } from './snapshot';

export type IRtdbMockQueryFactory<TSdk extends ISdk> = (
  store: IMockStore<TSdk>,
  query: ISerializedQuery<TSdk>
) => IRtdbQuery;

export const query: IRtdbMockQueryFactory<ISdk> = (store, query) => {
  const ref = reference(store, query);
  const q: IRtdbQuery = {
    endBefore: (value, key) => {
      throw new Error('not implemented');
    },
    startAfter: (value, key) => {
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
      return q;
    },
    isEqual: (other: IRtdbQuery) => {
      // TODO: look into implementation approach
      return false;
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
      eventType?: IRtdbDbEvent,
      callback?: (a: IRtdbDataSnapshot, b?: null | string) => any
    ) => {
      throw new Error('Not implemented. TODO');
    },
    on: (
      eventType: IRtdbDbEvent,
      callback: (a: IRtdbDataSnapshot, b?: null | string) => any,
      cancelCallbackOrContext?: (err?: Error) => void | null,
      context?: Record<string, unknown> | null
    ): ((a: IRtdbDataSnapshot, b?: null | string) => Promise<null>) => {
      store.addListener(
        query,
        eventType,
        callback,
        cancelCallbackOrContext,
        context
      );
      return null;
    },
    once: async (eventType: 'value'): Promise<IRtdbDataSnapshot> => {
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

  return q;
};
