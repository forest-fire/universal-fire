import { ISdk } from "@forest-fire/types";
import { Record } from "~/core";
import { Model } from "~/models/Model";

export function isHasManyRelationship<S extends ISdk, T extends Model>(
  rec: Record<S, T>,
  property: keyof T & string
): boolean {
  return rec.META.relationship(property)?.relType === "hasMany" ? true : false;
}
