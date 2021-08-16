import { IWatcherEventContext } from "~/types";

import { IDictionary } from "common-types";
import { hashToArray } from "typed-conversions";
import { ISdk } from "@forest-fire/types";
import { Model } from "~/models/Model";
/** a cache of all the watched  */
let watcherPool: IDictionary<IWatcherEventContext<ISdk, Model>> = {};

export function getWatcherPool<S extends ISdk = ISdk, T extends Model = Model>(): IDictionary<IWatcherEventContext<S, T>> {
  return watcherPool as unknown as IDictionary<IWatcherEventContext<S, T>>;
}

export function getWatcherPoolList<S extends ISdk = ISdk, T extends Model = Model>(): IWatcherEventContext<S, T>[] {
  return hashToArray(getWatcherPool()) as unknown as IWatcherEventContext<S, T>[];
}

export function addToWatcherPool<S extends ISdk, T extends Model>(
  item: IWatcherEventContext<S, T>
): void {
  watcherPool[item.watcherId] = item as unknown as IWatcherEventContext<ISdk, Model>;
}

export function getFromWatcherPool<S extends ISdk = ISdk, T extends Model = Model>(code: keyof typeof watcherPool): IWatcherEventContext<S, T> {
  return watcherPool[code] as unknown as IWatcherEventContext<S, T>;
}

export function clearWatcherPool(): void {
  watcherPool = {};
}



export function removeFromWatcherPool(code: keyof typeof watcherPool): IDictionary<IWatcherEventContext<ISdk, Model>> {
  delete watcherPool[code];
  return watcherPool;
}
