/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForeignKey, IFmLocalRelationshipEvent } from "~/types";

import { Record } from "~/core";
import { ISdk } from "@forest-fire/types";
import { Model } from "~/models/Model";
import { createCompositeKeyString } from "./createCompositeKeyString";
import { getIdFromKey } from "./getIdFromKey";

/**
 * sets a `Record`'s property to the optimistic values set
 * with the relationship CRUD event.
 */
export function locallyUpdateFkOnRecord<S extends ISdk, T extends Model>(
  rec: Record<T, S>,
  fkId: ForeignKey,
  event: IFmLocalRelationshipEvent<T>
): void {
  const relnType = rec.META.relationship(event.property).relType;

  // update lastUpdated but quietly as it will be updated again
  // once server responds
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  rec.set("lastUpdated", new Date().getTime(), true);
  // now work on a per-op basis
  const currentValue = rec.get(event.property);
  const fk = createCompositeKeyString(fkId);
  const id = getIdFromKey(fkId);
  switch (event.operation) {
    case "set":
    case "add": {
      const record = (rec as any)._data;
      record[event.property] = record[event.property] || {};
      record[event.property] =
        relnType === "hasMany" ? { ...currentValue, ...{ [fk]: true } } : fk;
      break;
    }
    case "remove":
      if (relnType === "hasMany") {
        delete (rec as any)._data[event.property][id];
      } else {
        (rec as any)._data[event.property] = "";
      }
      break;
  }
}
