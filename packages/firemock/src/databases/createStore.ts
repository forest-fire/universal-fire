import { IDictionary } from 'common-types';
import deepmerge from 'deepmerge';
import {
  dotify,
  get,
  getKey,
  getParent,
  join,
  networkDelay as delay,
  set,
} from '@/util';
import { deepEqual } from 'fast-equals';
import copy from 'fast-copy';
import { key as fbKey } from 'firebase-key';
import {
  IAbstractedDatabase,
  IMockDelayedState,
  IMockListener,
  IMockStore,
  mockDataIsDelayed,
  NetworkDelay,
} from '@forest-fire/types';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';

export function createStore<TState extends IDictionary = IDictionary>(
  container: IAbstractedDatabase,
  initialState: TState | IMockDelayedState<TState>
) {
  /**
   * The in-memory dictionary/hash mantained by the mock RTDB to represent
   * the state of the database
   */
  let _state: TState;
  /** flag to indicate whether dispatch events should be fired */
  let _silenceEvents: boolean = false;
  /** the artificial time delay used to simulate a real DB's network latency */
  let _networkDelay: NetworkDelay | number | [number, number] =
    NetworkDelay.lazer;
  /** event listeners setup to watch Firebase paths/queries */
  let _listeners: IMockListener[] = [];

  const networkDelay = async () => {
    await delay(_networkDelay);
  };

  const setNetworkDelay = (delay: NetworkDelay | number | [number, number]) => {
    _networkDelay = delay;
  };

  const config = container.config;

  /**
   * Connects the mock database via an asynch operation
   */
  const connect = async () => {
    let data: TState;
    if (mockDataIsDelayed(initialState)) {
      data = await initialState.connect();
    } else {
      await networkDelay();
      data = initialState;
    }
    _state = data;
  };

  const addListener: IMockStore<IDictionary>['addListener'] = async (
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

    _listeners.push({
      id: Math.random().toString(36).substr(2, 10),
      query,
      eventType,
      callback,
      cancelCallbackOrContext,
      context,
    });

    // function ref(dbPath: string) {
    //   return reference(api, dbPath);
    // }
    // const snapshot = await query
    //   .deserialize({ ref })
    //   .once(eventType === 'value' ? 'value' : 'child_added');

    // if (eventType === 'value') {
    //   callback(snapshot);
    // } else {
    //   const list = hashToArray(snapshot.val());
    //   if (eventType === 'child_added') {
    //     list.forEach((i: IDictionary) =>
    //       callback(new SnapShot(join(query.path, i.id), i))
    //     );
    //   }
    // }

    // return snapshot;
  };

  const removeListener = (id: string) => {
    _listeners = _listeners.filter((l) => l.id !== id);
  };
  const getAllListeners = () => {
    return _listeners;
  };

  const api: IMockStore<TState> = {
    api: container.apiKind,
    db: container.dbType,
    config,

    state: _state,

    networkDelay,
    setNetworkDelay,

    addListener,
    removeListener,
    getAllListeners,

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
    getDb<T = any>(path?: string) {
      return (path ? get(_state, dotify(path)) : _state) as T;
    },
    setDb(path: string, value: any, silent: boolean = false) {
      const dotPath = join(path);
      const oldRef = get(_state, dotPath);
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
        const parentValue: any = get(_state, getParent(dotPath));
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
        notify({ [dotPath]: value }, dbSnapshot);
      }
    },
    mergeDb<T = any>(path: string, value: T) {
      const old = get(_state, path);
      api.setDb(path, deepmerge(old, value));
    },
    updateDb<T = any>(path: string, value: T) {
      const dotPath = join(path);
      const oldValue: T = get(_state, dotPath);
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

      const newValue: T =
        typeof oldValue === 'object' ? { ...oldValue, ...value } : value;

      api.setDb(dotPath, newValue);
    },
    multiPathUpdate(data: IDictionary) {
      const snapshot = copy(_state);

      Object.keys(data).map((key) => {
        const value = data[key];
        const path = key;
        if (get(_state, path) !== value) {
          // silent set
          api.setDb(path, value, true);
        }
      });

      notify(data, snapshot);
    },
    removeDb(path: string) {
      if (!api.getDb(path)) {
        return;
      }
      api.setDb(path, null);
    },
    pushDb(path: string, value: any): string {
      const pushId = fbKey();
      const fullPath = join(path, pushId);
      const valuePlusId =
        typeof value === 'object' ? { ...value, id: pushId } : value;

      api.setDb(fullPath, valuePlusId);
      return pushId;
    },
    reset() {
      removeAllListeners();
      api.clearDb();
    },
  };

  return api;
}
