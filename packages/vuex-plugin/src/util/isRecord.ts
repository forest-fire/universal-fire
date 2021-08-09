import { IDictionary } from "common-types";
import { IFmWatchEvent, Model } from 'firemodel';
import { ISdk } from 'universal-fire';

/**
 * Detects whether the change is a `Record` or a `List` and ensures
 * that the **state** parameter is typed correctly as well as passing
 * back a boolean flag at runtime.
 */
export function isRecord<S extends ISdk, T extends Model>(
  state: T | IDictionary<T[]>,
  payload: IFmWatchEvent<S, T>
): state is T {
  return payload.watcherSource === 'record';
}

export function isList<S extends ISdk, T extends Model>(
  state: T | IDictionary<T[]>,
  payload: IFmWatchEvent<S, T>
): state is IDictionary<T[]> {
  return payload.watcherSource === 'list';
}