/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import {
  IMockStore,
  ISerializedQuery,
  IRtdbReference,
  IRtdbSdk,
} from '@forest-fire/types';
import { query } from './query';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { onDisconnect } from './onDisconnect';
import { FireMockError } from '../../../errors';
import { join } from '../../../util';
import { IDictionary } from 'common-types';

function isMultiPath(data: IDictionary) {
  Object.keys(data).map((d: never) => {
    if (!d) {
      data[d] = '/';
    }
  });
  const indexesAreStrings = Object.keys(data).every(
    (i) => typeof i === 'string'
  );
  const indexesLookLikeAPath = Object.keys(data).every(
    (i) => i.indexOf('/') !== -1
  );
  return indexesAreStrings && indexesLookLikeAPath ? true : false;
}

export function reference<TStore extends IMockStore<TSdk, IDictionary>, TSdk extends IRtdbSdk>(
  store: TStore,
  path: string | ISerializedQuery<TSdk> = ''
): IRtdbReference {
  const serializedQuery = typeof path === "string" ? new SerializedRealTimeQuery(path) : path;
  const query_ = query(store, serializedQuery);
  const ref: IRtdbReference = {
    orderByKey: query_.orderByKey,
    endAt: query_.endAt,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    endBefore: query_.endBefore,
    equalTo: query_.equalTo,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    get: query_.get,
    isEqual: query_.isEqual,
    limitToFirst: query_.limitToFirst,
    limitToLast: query_.limitToLast,
    off: query_.off,
    on: query_.on,
    once: query_.once,
    orderByChild: query_.orderByChild,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    orderByPriority: query_.orderByPriority,
    orderByValue: query_.orderByValue,
    get ref() {
      return query_.ref;
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method
    startAfter: query_.startAfter,
    startAt: query_.startAt,
    get key() {
      return serializedQuery.path
        ? serializedQuery.path.split('/').pop()
        : null;
    },
    child: (path) => {
      return reference(store, path);
    },
    onDisconnect: () => {
      return onDisconnect(store, serializedQuery as ISerializedQuery<TSdk>);
    },
    get parent() {
      return reference(
        store,
        !serializedQuery.path || serializedQuery.path.split('/').length === 1
          ? null
          : serializedQuery.path
            .split('/')
            .slice(0, serializedQuery.path.split('/').length - 1)
            .join('/')
      );
    },
    push: (value, onComplete) => {
      try {
        const key = store.pushDb(serializedQuery.path, value);
        if (onComplete) onComplete(undefined);
        const _ref = reference(store, join(serializedQuery.path, key));
        const _refPromise = Promise.resolve(_ref);
        return { ..._ref, ..._refPromise };
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
    remove: async (onComplete) => {
      try {
        store.removeDb(serializedQuery.path);
        if (onComplete) onComplete(undefined);
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
    get root() {
      return reference(store, null);
    },
    set: async (value, onComplete) => {
      try {
        store.setDb(serializedQuery.path, value);
        if (onComplete) onComplete(null);
        return store.networkDelay();
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
    setPriority: async () => {
      throw new FireMockError(
        `Setting priorities with setPriority() is not supported in Firemock and in general isn't a good idea with the Real Time Database.`,
        'not-supported'
      );
    },
    setWithPriority: async () => {
      throw new FireMockError(
        `Setting priorities with setWithPriority() is not supported in Firemock and in general isn't a good idea with the Real Time Database.`,
        'not-supported'
      );
    },
    toJSON: () => {
      return {
        identity: ref.toString(),
        query: serializedQuery.identity,
      };
    },
    toString: () => {
      return `FireMock::Query@${process.env.FIREBASE_DATA_ROOT_URL}/${JSON.stringify(serializedQuery.identity)}`;
    },
    transaction: async () => {
      return Promise.resolve({
        committed: true,
        snapshot: null,
        toJSON() {
          return {};
        },
      });
    },
    update: async (values, onComplete) => {
      try {
        if (isMultiPath(values)) {
          store.multiPathUpdate(values);
        } else {
          store.updateDb(serializedQuery.path, values);
        }

        if (onComplete) onComplete(undefined);
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
  };

  return ref;
}
