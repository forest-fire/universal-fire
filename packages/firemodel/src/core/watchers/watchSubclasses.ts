import { ISdk } from "@forest-fire/types";
import { Model } from "~/models/Model";
import { WatchList, WatchRecord } from "./index";

/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
export function getWatchList<T extends Model>(): WatchList<ISdk, T> {
  return new WatchList<ISdk, T>();
}

/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
export function getWatchRecord<T extends Model>(): WatchRecord<ISdk, T> {
  return new WatchRecord<ISdk, T>();
}
