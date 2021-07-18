import type { IModel, IRecord } from "@/types";
import { ISdk } from "universal-fire";

export function isHasManyRelationship<S extends ISdk, T extends IModel>(
  rec: IRecord<S, T>,
  property: keyof T & string
) {
  return rec.META.relationship(property)?.relType === "hasMany" ? true : false;
}
