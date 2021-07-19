import type { IRecord } from "@/types";
import { IModel, ISdk } from "universal-fire";

export function isHasManyRelationship<S extends ISdk, T extends IModel>(
  rec: IRecord<S, T>,
  property: keyof T & string
): boolean {
  return rec.META.relationship(property)?.relType === "hasMany" ? true : false;
}
