import { IFirebaseWatchContext, IRtdbDataSnapshot } from '@forest-fire/types';
import { IFirebaseWatchEvent, IFirebaseWatchHandler } from './rtdb-types';

export const WatcherEventWrapper = (context: IFirebaseWatchContext) => (
  handler: IFirebaseWatchHandler
) => {
  return (snapshot: IRtdbDataSnapshot, previousChildKey?: string) => {
    const value = snapshot.val();
    const key = snapshot.key;
    const kind = 'server-event';
    const fullEvent: IFirebaseWatchEvent = {
      // TODO: fix union type
      ...(context as any),
      value,
      key,
      kind,
      previousChildKey,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return handler(fullEvent);
  };
};
