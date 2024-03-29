import { IDictionary } from 'common-types';
import deepmerge from 'deepmerge';
import {
  dotify,
  dotifyKeys,
  getKey,
  getParent,
  join,
  networkDelay as delay,
  set,
} from '~/util';

import { get } from 'native-dash';
import { deepEqual } from 'fast-equals';
import copy from 'fast-copy';
import { key as fbKey } from 'firebase-key';
import {
  ApiKind,
  EventTypePlusChild,
  IDatabaseConfig,
  IMockDelayedState,
  IMockListener,
  IMockStore,
  IRtdbSdk,
  isAdminSdk,
  ISdk,
  isFirestoreDatabase,
  NetworkDelay,
} from '@forest-fire/types';
import {
  SerializedRealTimeQuery,
  slashNotation,
} from '@forest-fire/serialized-query';
import { FireMockError } from '../errors';
import { IMockWatcherGroupEvent } from '../@types';
import { notify } from './rtdb';

function getFromDotPath(obj: IDictionary<any>, dotPath: string) {
  return ['', '/'].includes(dotPath) ? obj : get(obj, dotPath);
}
/**
 * internal function responsible for the actual removal of
 * a listener.
 */
function cancelCallback<TSdk extends ISdk>(
  removed: IMockListener<TSdk>[]
): number {
  let count = 0;
  removed.forEach((l) => {
    if (typeof l.cancelCallbackOrContext === 'function') {
      (l.cancelCallbackOrContext as () => any)();
      count++;
    }
  });
  return count;
}

export function createStore<TSdk extends ISdk>(
  sdk: TSdk,
  config: IDatabaseConfig,
  initialState: IDictionary | IMockDelayedState<IDictionary>
): IMockStore<TSdk> {
  if (isFirestoreDatabase(sdk)) {
    throw new FireMockError(
      'Currently Firemock is not implemented for the Firestore Database!'
    );
  }

  /**
   * The in-memory dictionary/hash mantained by the mock RTDB to represent
   * the state of the database
   */
  const _state: IDictionary = initialState || {};
  /** flag to indicate whether dispatch events should be fired */
  let _silenceEvents = false;
  /** the artificial time delay used to simulate a real DB's network latency */
  let _networkDelay: NetworkDelay | number | [number, number] =
    NetworkDelay.lazer;

  let _listeners: IMockListener<ISdk>[] = [];

  const networkDelay = async () => {
    await delay(_networkDelay);
  };

  const setNetworkDelay = (delay: NetworkDelay | number | [number, number]) => {
    _networkDelay = delay;
  };

  const addListener: IMockStore<TSdk>['addListener'] = (
    pathOrQuery,
    eventType,
    callback,
    cancelCallbackOrContext,
    context
  ) => {
    const query =
      typeof pathOrQuery === 'string'
        ? // TODO: this needs to be generalized across RTDB and Firestore
          new SerializedRealTimeQuery(pathOrQuery)
        : pathOrQuery;

    const listener = {
      id: Math.random().toString(36).substr(2, 10),
      query,
      eventType,
      callback,
      cancelCallbackOrContext,
      context,
    } as IMockListener<TSdk>;
    _listeners.push(listener);

    return listener;
  };

  const groupEventsByWatcher = (
    data: IDictionary,
    dbSnapshot: IDictionary
  ): IMockWatcherGroupEvent<TSdk>[] => {
    const _data = dotifyKeys(data);

    const eventPaths = Object.keys(_data).map((i) => dotify(i));

    const response: IMockWatcherGroupEvent<TSdk>[] = [];
    const relativePath = (full: string, partial: string) => {
      return full.replace(partial, '');
    };

    const justKey = (obj: IDictionary) => (obj ? Object.keys(obj)[0] : null);
    const justValue = (obj: IDictionary): unknown =>
      justKey(obj) ? obj[justKey(obj)] : null;
    api.getAllListeners()?.forEach((listener) => {
      const eventPathsUnderListener = eventPaths.filter((path) =>
        path.includes(dotify(listener.query.path))
      );

      if (eventPathsUnderListener.length === 0) {
        // if there are no listeners then there's nothing to do
        return;
      }

      const paths: string[] = [];

      const listenerPath = dotify(listener.query.path);
      const changeObject = eventPathsUnderListener.reduce(
        (changes: IDictionary<IMockWatcherGroupEvent<TSdk>>, path) => {
          paths.push(path);
          if (dotify(listener.query.path) === path) {
            changes = _data[path];
          } else {
            set(changes, dotify(relativePath(path, listenerPath)), _data[path]);
          }

          return changes;
        },
        {}
      );

      const key: string =
        listener.eventType === 'value'
          ? changeObject
            ? justKey(changeObject)
            : listener.query.path.split('.').pop()
          : dotify(
              join(slashNotation(listener.query.path), justKey(changeObject))
            );

      const newResponse = {
        listenerId: listener.id,
        listenerPath,
        listenerEvent: listener.eventType,
        callback: listener.callback,
        eventPaths: paths,
        key,
        changes: justValue(changeObject),
        value:
          listener.eventType === 'value'
            ? api.getDb(listener.query.path)
            : api.getDb(key),
        priorValue:
          listener.eventType === 'value'
            ? getFromDotPath(dbSnapshot, listener.query.path)
            : justValue(getFromDotPath(dbSnapshot, listener.query.path)),
      };

      response.push(newResponse);
    });
    return response;
  };

  const removeAllListeners = () => {
    const howMany = cancelCallback(_listeners);
    _listeners = [];
    return howMany;
  };

  const getAllListeners = () => {
    return _listeners;
  };

  const api: IMockStore<TSdk> = {
    api: isAdminSdk(sdk)
      ? (ApiKind.admin as IMockStore<TSdk>['api'])
      : (ApiKind.client as IMockStore<TSdk>['api']),

    config,
    state: _state,

    networkDelay,
    setNetworkDelay,

    addListener,
    removeListener(eventType, callback?, context?: IDictionary) {
      if (!eventType) {
        return removeAllListeners();
      }

      if (!callback) {
        const removed = _listeners.filter((l) => l.eventType === eventType);
        _listeners = _listeners.filter((l) => l.eventType !== eventType);
        return cancelCallback(removed);
      }

      if (!context) {
        // use eventType and callback to identify
        const removed = _listeners
          .filter((l) => l.callback === callback)
          .filter((l) => l.eventType === eventType);

        _listeners = _listeners.filter(
          (l) => l.eventType !== eventType || l.callback !== callback
        );

        return cancelCallback(removed);
      } else {
        // if we have context then we can ignore other params
        const removed = _listeners
          .filter((l) => l.callback === callback)
          .filter((l) => l.eventType === eventType)
          .filter((l) => l.context === context);

        _listeners = _listeners.filter(
          (l) =>
            l.context !== context ||
            l.callback !== callback ||
            l.eventType !== eventType
        );
        return cancelCallback(removed);
      }
    },
    removeAllListeners,
    getAllListeners,
    listenerPaths(lookFor?: EventTypePlusChild | EventTypePlusChild[]) {
      if (lookFor && !Array.isArray(lookFor)) {
        lookFor =
          lookFor === 'child'
            ? ['child_added', 'child_changed', 'child_removed', 'child_moved']
            : [lookFor];
      }
      return lookFor
        ? _listeners
            .filter((l) => lookFor.includes(l.eventType as never))
            .map((l) => l.query.path)
        : _listeners.map((l) => l.query.path);
    },
    silenceEvents: () => {
      _silenceEvents = true;
    },
    restoreEvents: () => {
      _silenceEvents = false;
    },
    shouldSendEvents: () => {
      return !_silenceEvents;
    },

    clearDb() {
      const keys = Object.keys(_state);
      keys.forEach((key) => delete _state[key]);
    },
    getDb<D extends unknown = never>(path?: string): D {
      const dotifyPath = path ? dotify(path) : undefined;
      return (dotifyPath ? getFromDotPath(_state, dotifyPath) : _state) as D;
    },
    setDb<V extends unknown>(path: string, value: V, silent = false) {
      const dotPath = join(path);
      const oldRef = getFromDotPath(_state, dotPath);
      const oldValue =
        typeof oldRef === 'object' ? { ...oldRef, ...{} } : oldRef;
      const isReference = ['object', 'array'].includes(typeof value);
      const dbSnapshot = copy({ ..._state });

      // ignore if no change
      if (
        (isReference && deepEqual(oldValue, value)) ||
        (!isReference && oldValue === value)
      ) {
        return;
      }

      if (value === null) {
        const parentValue: any = getFromDotPath(_state, getParent(dotPath));
        if (typeof parentValue === 'object') {
          delete parentValue[getKey(dotPath)];

          set(_state, getParent(dotPath), parentValue);
        } else {
          set(_state, dotPath, undefined);
        }
      } else {
        set(_state, dotPath, value);
      }

      if (!silent) {
        const events = groupEventsByWatcher({ [dotPath]: value }, dbSnapshot);
        notify(this)(events as IMockWatcherGroupEvent<IRtdbSdk>[], dbSnapshot);
      }
    },
    mergeDb<T extends unknown>(path: string, value: T) {
      const dotPath = join(path);

      const old = getFromDotPath(_state, dotPath);
      const merge = deepmerge(old, value);
      this.setDb(path || '', merge);
    },
    updateDb<T extends unknown>(path: string, value: T) {
      const dotPath = join(path);
      const oldValue: T = getFromDotPath(_state, dotPath);
      let changed = true;
      if (
        typeof value === 'object' &&
        Object.keys(value).every(
          (k) =>
            (oldValue ? (oldValue as IDictionary)[k] : null) ===
            (value as IDictionary)[k]
        )
      ) {
        changed = false;
      }

      if (typeof value !== 'object' && value === oldValue) {
        changed = false;
      }

      if (!changed) {
        return;
      }

      const newValue =
        typeof oldValue === 'object'
          ? { ...(oldValue as IDictionary), ...(value as IDictionary) }
          : value;

      this.setDb(dotPath, newValue);
    },
    multiPathUpdate(data: IDictionary) {
      const snapshot = copy(_state);

      Object.keys(data).map((key) => {
        const value = data[key];
        const path = key;
        if (getFromDotPath(_state, path) !== value) {
          // silent set
          this.setDb(path, value, true);
        }
      });

      const events = groupEventsByWatcher(data, snapshot);

      notify(this)(events as IMockWatcherGroupEvent<IRtdbSdk>[], snapshot);
    },
    removeDb(path: string) {
      if (!this.getDb(path)) {
        return;
      }
      this.setDb(path, null);
    },
    pushDb(path: string, value: unknown): string {
      const pushId = fbKey();
      const fullPath = join(path, pushId);
      const valuePlusId =
        typeof value === 'object' ? { ...value, id: pushId } : value;
      this.setDb(fullPath, valuePlusId);
      return pushId;
    },
    reset() {
      _listeners = [];
      this.clearDb();
    },
  };

  return api;
}
