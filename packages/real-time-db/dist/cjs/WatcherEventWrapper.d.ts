import { IFirebaseWatchHandler, IFirebaseWatchContext } from "./types";
import { IRtdbDataSnapshot } from "@forest-fire/types";
export declare const WatcherEventWrapper: (context: IFirebaseWatchContext) => (handler: IFirebaseWatchHandler) => (snapshot: IRtdbDataSnapshot, previousChildKey?: string) => any;
