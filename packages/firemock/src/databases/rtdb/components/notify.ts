/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IMockWatcherGroupEvent } from '~/@types';
import type {
  IRtdbDbEvent,
  IMockStore,
  ISdk,
  IMockListener,
  IRtdbSdk,
  SnapshotFrom,
  EventTypePlusChild,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';
import { join, stripLeadingDot, removeDots, dotify } from '~/util';
import { get } from 'native-dash';

import { snapshot } from '..';

// TODO: Removed because this state is going to hanlded in `createStore.ts`
// let _listeners: IListener[] = [];

/**
 * **addListener**
 *
 * Adds a listener for watched events; setup by
 * the `query.on()` API call.
 *
 * This listener is
 * pushed onto a private stack but can be interogated
 * with a call to `getListeners()` or if you're only
 * interested in the _paths_ which are being watched
 * you can call `listenerPaths()`.
 */
// TODO: the code below has been moved into `createStore.ts`
// export async function addListener(
//   pathOrQuery: string | SerializedRealTimeQuery<any>,
//   eventType: IRtdbDbEvent,
//   callback: IFirebaseEventHandler,
//   cancelCallbackOrContext?: (err?: Error) => void,
//   context?: IDictionary
// ): Promise<IRtdbDataSnapshot> {
//   const query = (typeof pathOrQuery === 'string'
//     ? new SerializedRealTimeQuery(join(pathOrQuery))
//     : pathOrQuery) as SerializedRealTimeQuery;
//   pathOrQuery = (typeof pathOrQuery === 'string'
//     ? join(pathOrQuery)
//     : query.path) as string;

//   _listeners.push({
//     id: Math.random().toString(36).substr(2, 10),
//     query,
//     eventType,
//     callback,
//     cancelCallbackOrContext,
//     context,
//   });

//   function ref(dbPath: string) {
//     return new Reference(dbPath);
//   }
//   const snapshot = await query
//     .deserialize({ ref })
//     .once(eventType === 'value' ? 'value' : 'child_added');

//   if (eventType === 'value') {
//     callback(snapshot);
//   } else {
//     const list = hashToArray(snapshot.val());
//     if (eventType === 'child_added') {
//       list.forEach((i: IDictionary) =>
//         callback(new SnapShot(join(query.path, i.id), i))
//       );
//     }
//   }

//   return snapshot;
// }

/**
 * **removeListener**
 *
 * Removes an active listener (or multiple if the info provided matches more
 * than one).
 *
 * If you provide the `context` property it will use this to identify
 * the listener, if not then it will use `eventType` (if available) as
 * well as `callback` (if available) to identify the callback(s)
 */
// TODO: This has been moved into  `createStore.ts`
// export function removeListener(
//   eventType?: IRtdbDbEvent,
//   callback?: (snap: IRtdbDataSnapshot, key?: string) => void,
//   context?: IDictionary
// ): number {
//   if (!eventType) {
//     return removeAllListeners();
//   }

//   if (!callback) {
//     const removed = _listeners.filter((l) => l.eventType === eventType);
//     _listeners = _listeners.filter((l) => l.eventType !== eventType);
//     return cancelCallback(removed);
//   }

//   if (!context) {
//     // use eventType and callback to identify
//     const removed = _listeners
//       .filter((l) => l.callback === callback)
//       .filter((l) => l.eventType === eventType);

//     _listeners = _listeners.filter(
//       (l) => l.eventType !== eventType || l.callback !== callback
//     );

//     return cancelCallback(removed);
//   } else {
//     // if we have context then we can ignore other params
//     const removed = _listeners
//       .filter((l) => l.callback === callback)
//       .filter((l) => l.eventType === eventType)
//       .filter((l) => l.context === context);

//     _listeners = _listeners.filter(
//       (l) =>
//         l.context !== context ||
//         l.callback !== callback ||
//         l.eventType !== eventType
//     );

//     return cancelCallback(removed);
//   }
// }

/**
 * internal function responsible for the actual removal of
 * a listener.
 */
// function cancelCallback<TSdk extends ISdk>(
//   removed: IMockListener<TSdk>[]
// ): number {
//   let count = 0;
//   removed.forEach((l) => {
//     if (typeof l.cancelCallbackOrContext === 'function') {
//       (l.cancelCallbackOrContext as () => any)();
//       count++;
//     }
//   });
//   return count;
// }

// TODO: This method should be rewritten or we have to write tests without depending of this method.
/// Because it is only being used in tests
// export function removeAllListeners<TSdk extends ISdk>(store: IMockStore<TSdk>) {
//   const _listeners = store.getAllListeners();
//   return (): number => {
//     const howMany = cancelCallback(_listeners);
//     _listeners = [];
//     return howMany;
//   };
// }

/**
 * **listenerCount**
 *
 * Provides a numberic count of listeners on the database.
 * Optionally you can state the `EventType` and get a count
 * of only this type of event.
 */
// export function listenerCount(type?: IRtdbDbEvent) {
//   return type
//     ? _listeners.filter((l) => l.eventType === type).length
//     : _listeners.length;
// }

/**
 * **listenerPaths**
 *
 * Provides a list of _paths_ in the database which have listeners
 * attached to them. Optionally you can state the `EventType` and filter down to
 * only this type of event or "set of events".
 *
 * You can also just state "child" as the event and it will resolve to all child
 * events: `[ 'child_added', 'child_changed', 'child_removed', 'child_moved' ]`
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function listenerPaths<TSdk extends ISdk>(store: IMockStore<TSdk>) {
  const _listeners = store.getAllListeners();
  return (lookFor?: EventTypePlusChild | EventTypePlusChild[]) => {
    if (lookFor && !Array.isArray(lookFor)) {
      lookFor =
        lookFor === 'child'
          ? ['child_added', 'child_changed', 'child_removed', 'child_moved']
          : [lookFor];
    }
    return lookFor
      ? _listeners
          .filter((l) => lookFor.includes(l.eventType as IRtdbDbEvent))
          .map((l) => l.query.path)
      : _listeners.map((l) => l.query.path);
  };
}

/**
 * **getListeners**
 *
 * Returns the list of listeners.Optionally you can state the `EventType` and
 * filter down to only this type of event or "set of events".
 *
 * You can also just state "child" as the event and it will resolve to all child
 * events: `[ 'child_added', 'child_changed', 'child_removed', 'child_moved' ]`
 */
export function getListeners<TSdk extends IRtdbSdk>(store: IMockStore<TSdk>) {
  const _listeners = store.getAllListeners();
  return (...lookFor: EventTypePlusChild[]): IMockListener<TSdk>[] => {
    const childEvents: Omit<IRtdbDbEvent, 'child'>[] = [
      'child_added',
      'child_changed',
      'child_removed',
      'child_moved',
    ];
    const allEvents = childEvents.concat(['value']);
    const events =
      lookFor.length === 0
        ? allEvents
        : lookFor.length === 1 && lookFor[0] === 'child'
        ? childEvents
        : lookFor;

    return _listeners.filter((l) => events.includes(l.eventType));
  };
}

function keyDidNotPreviouslyExist<TSdk extends ISdk>(
  e: IMockWatcherGroupEvent<TSdk>,
  dbSnapshot: IDictionary
) {
  return get(dbSnapshot, e.key) === undefined ? true : false;
}

/**
 * **notify**
 *
 * Based on a dictionary of paths/values it reduces this to events to
 * send to zero or more listeners.
 */
export function notify<TSdk extends IRtdbSdk>(api: IMockStore<TSdk>) {
  return function (events: IMockWatcherGroupEvent<TSdk>[], dbSnapshot: IDictionary): void {
    events.forEach((evt) => {
      const isDeleteEvent = evt.value === null || evt.value === undefined;
      switch (evt.listenerEvent) {
        case 'child_removed':
          if (isDeleteEvent) {
            evt.callback(snapshot(api, evt.key, evt.priorValue) as SnapshotFrom<TSdk>);
          }
          return;
        case 'child_added':
          if (!isDeleteEvent && keyDidNotPreviouslyExist<TSdk>(evt, dbSnapshot)) {
            evt.callback(snapshot(api, evt.key, evt.value) as SnapshotFrom<TSdk>);
          }
          return;
        case 'child_changed':
          if (!isDeleteEvent) {
            evt.callback(snapshot(api, evt.key, evt.value) as SnapshotFrom<TSdk>);
          }
          return;
        case 'child_moved':
          if (!isDeleteEvent && keyDidNotPreviouslyExist<TSdk>(evt, dbSnapshot)) {
            // TODO: if we implement sorting then add the previousKey value
            evt.callback(snapshot(api, evt.key, evt.value) as SnapshotFrom<TSdk>);
          }
          return;
        case 'value': {
          const snapKey = snapshot(api, evt.listenerPath, evt.value).key;

          if (snapKey === evt.key) {
            // root set
            evt.callback(
              snapshot(
                api,
                evt.listenerPath,
                evt.value === null || evt.value === undefined
                  ? undefined
                  : { [evt.key]: evt.value }
              ) as SnapshotFrom<TSdk>
            );
          } else {
            // property set
            const value =
              evt.value === null ? api.getDb(evt.listenerPath) : evt.value;
            evt.callback(snapshot(api, evt.listenerPath, value) as SnapshotFrom<TSdk>);
          }
        }
      } // end switch
    });
  };
}

export type IListenerPlus<TSdk extends ISdk> = IMockListener<TSdk> & {
  id: string;
  changeIsAtRoot: boolean;
};

/**
 * **findChildListeners**
 *
 * Finds "child events" listening to a given _parent path_; optionally
 * allowing for specification of the specific `EventType` or `EventType(s)`.
 *
 * @param changePath the _parent path_ that children are detected off of
 * @param eventTypes <optional> the specific child event (or events) to filter down to; if you have more than one then you should be aware that this property is destructured so the calling function should pass in an array of parameters rather than an array as the second parameter
 */
export function findChildListeners<TSdk extends ISdk>(store: IMockStore<TSdk>) {
  const _listeners = store.getAllListeners();
  return (changePath: string, ...eventTypes: IRtdbDbEvent[]) => {
    changePath = stripLeadingDot(changePath.replace(/\//g, '.'));
    eventTypes =
      eventTypes.length !== 0
        ? eventTypes
        : ['child_added', 'child_changed', 'child_moved', 'child_removed'];

    const decendants = _listeners
      .filter((l) => eventTypes.includes(l.eventType as IRtdbDbEvent))
      .filter((l) => changePath.startsWith(dotify(l.query.path)))
      .reduce((acc: IListenerPlus<ISdk>[], listener) => {
        const id = removeDots(
          changePath
            .replace(listener.query.path, '')
            .split('.')
            .filter((i) => i)[0]
        );
        const remainingPath = stripLeadingDot(
          changePath.replace(stripLeadingDot(listener.query.path), '')
        );

        const changeIsAtRoot = id === remainingPath;
        acc.push({ ...listener, ...{ id, changeIsAtRoot } });
        return acc;
      }, []);

    return decendants;
  };
}

/**
 * Finds all value listeners on a given path or below.
 * Unlike child listeners, Value listeners listen to changes at
 * all points below the registered path.
 *
 * @param path path to root listening point
 */
export function findValueListeners<TSdk extends ISdk>(store: IMockStore<TSdk>) {
  const _listeners = store.getAllListeners();
  return (path: string): IMockListener<ISdk>[] => {
    // TODO: Fix this type issue
    return _listeners.filter(
      (l) =>
        join(path).indexOf(join(l.query.path)) !== -1 && l.eventType === 'value'
    );
  };
}
