/* eslint-disable @typescript-eslint/require-await */
import { IMockStore, ISerializedQuery } from '@forest-fire/types';
import { IRtdbReference } from '@forest-fire/types';
import { query } from './query';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { onDisconnect } from './onDisconnect';
import { FireMockError } from '@/errors';
import { IRtdbSdk } from '@forest-fire/types/src';
import { join } from '../../../util';


export const reference = <T extends IMockStore<TSdk>, TSdk extends IRtdbSdk>(
  store: T,
  path: string | ISerializedQuery<TSdk, any> = ''
): IRtdbReference => {
  const _query: ISerializedQuery<TSdk> =
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
    root: reference(store, null),
    set: async (value, onComplete) => {
      try {
        store.setDb(_query.path, value);
        if (onComplete) onComplete(undefined);
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
