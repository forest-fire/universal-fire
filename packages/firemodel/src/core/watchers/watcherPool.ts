import { IReduxDispatch, IWatcherEventContext, IModel } from "@/types";

import { IDictionary } from "common-types";
import { hashToArray } from "typed-conversions";
import { ISdk } from "@forest-fire/types";

/** a cache of all the watched  */
let watcherPool: IDictionary<IWatcherEventContext<ISdk, IModel>> = {};

export function getWatcherPool<S extends ISdk = ISdk, T extends IModel = IModel>(): IDictionary<IWatcherEventContext<S, T>> {
  return watcherPool as unknown as IDictionary<IWatcherEventContext<S, T>>;
}

export function getWatcherPoolList<S extends ISdk = ISdk, T extends IModel = IModel>(): IWatcherEventContext<S, T>[] {
  return hashToArray(getWatcherPool()) as unknown as IWatcherEventContext<S, T>[];
}

export function addToWatcherPool<S extends ISdk, T extends IModel>(
  item: IWatcherEventContext<S, T>
): void {
  watcherPool[item.watcherId] = item as unknown as IWatcherEventContext<ISdk, IModel>;
}

export function getFromWatcherPool<S extends ISdk = ISdk, T extends IModel = IModel>(code: keyof typeof watcherPool): IWatcherEventContext<S, T> {
  return watcherPool[code] as unknown as IWatcherEventContext<S, T>;
}

export function clearWatcherPool(): void {
  watcherPool = {};
}

/**
 * Each watcher must have it's own `dispatch()` function which
 * is reponsible for capturing the "context". This will be used
 * both by locally originated events (which have more info) and
 * server based events.
 */
export function addDispatchForWatcher(
  code: keyof typeof watcherPool,
  dispatch: IReduxDispatch
) {
  //
}

export function removeFromWatcherPool(code: keyof typeof watcherPool) {
  delete watcherPool[code];
  return watcherPool;
}
