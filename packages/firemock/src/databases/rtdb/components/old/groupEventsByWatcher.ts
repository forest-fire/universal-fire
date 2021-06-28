import { IDictionary, pathJoin } from 'common-types';
import { dotify, dotifyKeys, get, set, slashNotation } from '@/util';
import { getListeners } from '@/databases/rtdb';
import { IMockWatcherGroupEvent } from '@/@types';

/**
 * Will aggregate the data passed in to dictionary objects of paths
 * which fire at the root of the listeners/watchers that are currently
 * on the database.
 */
export function groupEventsByWatcher(
  data: IDictionary,
  dbSnapshot: IDictionary
): IMockWatcherGroupEvent[] {
  data = dotifyKeys(data);

  // const getFromSnapshot = (path: string) => get(dbSnapshot, dotify(path));
  const eventPaths = Object.keys(data).map((i) => dotify(i));

  const response: IMockWatcherGroupEvent[] = [];
  const relativePath = (full: string, partial: string) => {
    return full.replace(partial, '');
  };

  const justKey = (obj: IDictionary) => (obj ? Object.keys(obj)[0] : null);
  const justValue = (obj: IDictionary) =>
    justKey(obj) ? obj[justKey(obj)] : null;

  getListeners().forEach((listener) => {
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
      (changes: IDictionary<IMockWatcherGroupEvent>, path) => {
        paths.push(path);
        if (dotify(listener.query.path) === path) {
          changes = data[path];
        } else {
          set(changes, dotify(relativePath(path, listenerPath)), data[path]);
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
            pathJoin(slashNotation(listener.query.path), justKey(changeObject))
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
          ? getDb(listener.query.path)
          : getDb(key),
      priorValue:
        listener.eventType === 'value'
          ? get(dbSnapshot, listener.query.path)
          : justValue(get(dbSnapshot, listener.query.path)),
    };

    response.push(newResponse);
  });

  return response;
}
