/* eslint-disable @typescript-eslint/require-await */
import {
  IMockStore,
  ISerializedQuery,
  IRtdbSdk,
  IRtdbReference,
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

export function reference<T extends IMockStore<TSdk>, TSdk extends IRtdbSdk>(
  store: T,
  path: string | ISerializedQuery<TSdk> = ''
): IRtdbReference {
  const _query: ISerializedQuery<IRtdbSdk> =
    typeof path === 'string' ? new SerializedRealTimeQuery<TSdk>(path) : path;

  const ref: IRtdbReference = {
    ...query(store, _query),
    key: _query.path ? _query.path.split('/').pop() : null,
    child: (path) => {
      return reference(store, path);
    },
    onDisconnect: () => {
      return onDisconnect(store, _query);
    },
    parent: reference(
      store,
      !_query.path || _query.path.split('/').length === 1
        ? null
        : _query.path
            .split('/')
            .slice(0, _query.path.split('/').length - 1)
            .join('/')
    ),
    push: (value, onComplete) => {
      try {
        const key = store.pushDb(_query.path, value);
        if (onComplete) onComplete(undefined);
        const _ref = reference(store, join(_query.path, key));
        const _refPromise = Promise.resolve(_ref);
        return { ..._ref, ..._refPromise };
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
    remove: async (onComplete) => {
      try {
        store.removeDb(_query.path);
        if (onComplete) onComplete(undefined);
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
    root: reference(store, null),
    set: async (value, onComplete) => {
      try {
        store.setDb(_query.path, value);
        if (onComplete) onComplete(null);
        return store.networkDelay();
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
    setPriority: async (_priority, _onComplete) => {
      throw new FireMockError(
        `Setting priorities with setPriority() is not supported in Firemock and in general isn't a good idea with the Real Time Database.`,
        'not-supported'
      );
    },
    setWithPriority: async (_val, _priority, _onComplete) => {
      throw new FireMockError(
        `Setting priorities with setWithPriority() is not supported in Firemock and in general isn't a good idea with the Real Time Database.`,
        'not-supported'
      );
    },
    toJSON: () => {
      return {
        identity: ref.toString(),
        query: _query.identity,
      };
    },
    toString: () => {
      return `FireMock::Query@${process.env.FIREBASE_DATA_ROOT_URL}/${_query.path}`;
    },
    transaction: async (_transaction) => {
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
          store.updateDb(_query.path, values);
        }

        if (onComplete) onComplete(undefined);
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
  };

  return ref;
}
