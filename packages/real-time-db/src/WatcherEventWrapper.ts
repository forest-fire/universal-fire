import {
  IFirebaseWatchEvent,
  IFirebaseWatchHandler,
  IFirebaseWatchContext,
} from './rtdb-types';
import { IRtdbDataSnapshot } from '@forest-fire/types';

export const WatcherEventWrapper = (context: IFirebaseWatchContext) => (
  handler: IFirebaseWatchHandler
) => {
  return (snapshot: IRtdbDataSnapshot, previousChildKey?: string) => {
    const value = snapshot.val();
    const key = snapshot.key;
    const kind = 'server-event';
    const fullEvent: IFirebaseWatchEvent = {
      ...context,
      value,
      key,
      kind,
      previousChildKey,
    };

    return handler(fullEvent);
  };
};
