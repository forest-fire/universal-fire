/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ISdk, ISerializedQuery } from "@forest-fire/types";
import { Model } from "~/models";

/**
 * Adjusts the query so that the next "page" will be loaded
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function queryAdjustForNext<S extends ISdk, T extends Model>(q: ISerializedQuery<S, T>, currentPage: number) {
  // TODO: finish
  return q;
}
