import {
  IMockStore,
  IRtdbAdminReference,
  ISerializedQuery,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';
import { IRtdbReference } from '@forest-fire/types';
import { query } from './query';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { onDisconnect } from './onDisconnect';
import { join } from 'lodash';
import { FireMockError } from '@/errors';

export type IRtdbMockReferenceFactory = (
  store: IMockStore<IDictionary>,
  path: string
) => IRtdbReference;

export const reference: IRtdbMockReferenceFactory = (
  store,
  path: string | ISerializedQuery = ''
) => {
  const _query: ISerializedQuery =
    typeof path === 'string' ? new SerializedRealTimeQuery(path) : path;

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
        return reference(store, join(_query.path, key));
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
    set: async (value, onComplete) => {
      try {
        store.setDb(_query.path, value);
        if (onComplete) onComplete(undefined);
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
    setPriority: async (priority, onComplete) => {
      throw new FireMockError(
        `Setting priorities with setPriority() is not supported in Firemock and in general isn't a good idea with the Real Time Database.`,
        'not-supported'
      );
    },
    setWithPriority: async (val, priority, onComplete) => {
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
    transaction: async (transaction) => {
      // TODO: lookup how this was being handled
    },
    update: async (values, onComplete) => {
      try {
        store.updateDb(_query.path, values);
        if (onComplete) onComplete(undefined);
      } catch (e) {
        if (onComplete) onComplete(e);
      }
    },
  };

  return ref;
};
