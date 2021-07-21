import { IFmLocalRelationshipEvent, IModel } from "@/types";

import { Record } from "@/core";
import { fk } from "common-types";
import { ISdk } from "@forest-fire/types";

/**
 * sets the `Record` property to the optimistic values set
 * with the relationship CRUD event.
 *
 * This function has no concern with dispatch or the FK model
 * and any updates that may need to take place there.
 */
export function locallyUpdateFkOnRecord<S extends ISdk, TFrom extends IModel, TTo extends IModel = IModel>(
  rec: Record<S, TFrom>,
  fkId: fk,
  event: IFmLocalRelationshipEvent<TFrom, TTo>
): void {
  const relnType = rec.META.relationship(event.property).relType;

  // update lastUpdated but quietly as it will be updated again
  // once server responds
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  rec.set("lastUpdated", new Date().getTime(), true);
  // now work on a per-op basis
  switch (event.operation) {
    case "set":
    case "add":
      (rec as any)._data[event.property] =
        relnType === "hasMany"
          ? { ...rec.data[event.property], ...{ [fkId]: true } }
          : fkId;
      return;
    case "remove":
      if (relnType === "hasMany") {
        delete (rec as any)._data[event.property][fkId];
      } else {
        (rec as any)._data[event.property] = "";
      }
      return;
  }
}
