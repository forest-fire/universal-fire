import { IDictionary } from "common-types";
import { IFmWatchEvent, IModel, Model } from "firemodel";
import { ISdk } from "universal-fire";

/**
 * Detects whether the change is a `Record` or a `List` and ensures
 * that the **state** parameter is typed correctly as well as passing
 * back a boolean flag at runtime.
 */
export function isRecord<T extends Model>(
  state: IModel<T> | IDictionary<IModel<T>[]>,
  payload: IFmWatchEvent<ISdk, T>
): state is T {
  return payload.watcherSource === "record";
}
