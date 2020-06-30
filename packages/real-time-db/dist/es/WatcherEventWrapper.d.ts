import { IFirebaseWatchContext, IRtdbDataSnapshot } from '@forest-fire/types';
import { IFirebaseWatchHandler } from './rtdb-types';
export declare const WatcherEventWrapper: (context: IFirebaseWatchContext) => (handler: IFirebaseWatchHandler) => (snapshot: IRtdbDataSnapshot, previousChildKey?: string) => any;
