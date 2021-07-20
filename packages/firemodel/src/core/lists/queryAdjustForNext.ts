import { ISerializedQuery } from "@forest-fire/types";

/**
 * Adjusts the query so that the next "page" will be loaded
 */
export function queryAdjustForNext<Q extends ISerializedQuery<any, any>>(q: Q, currentPage: number) {
  // TODO: finish
  return q;
}
