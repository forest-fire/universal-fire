import {
  IMockStore,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
  IRtdbQuery,
  IRtdbReference,
  ISerializedQuery,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';
import { snapshot } from './snapshot';

export type IRtdbMockQueryFactory = (
  store: IMockStore<IDictionary>,
  query: ISerializedQuery
) => IRtdbQuery;

export const query: IRtdbMockQueryFactory = (store, query) => {
  const q: IRtdbQuery = {
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
    ) => {},
    on: (
      eventType: IRtdbDbEvent,
      callback: (a: IRtdbDataSnapshot, b?: null | string) => any,
      cancelCallbackOrContext?: (err?: Error) => void | null,
      context?: object | null
    ): ((a: IRtdbDataSnapshot, b?: null | string) => Promise<null>) => {
      store.addListener<IRtdbDbEvent, IRtdbDataSnapshot>(
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
      return snapshot(store, query);
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
