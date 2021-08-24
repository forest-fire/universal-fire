import { ISdk } from "@forest-fire/types";
import { Record } from "~/core";
import { Model } from "~/models/Model";
import { PropertyOf } from "~/types";

export function isHasManyRelationship<S extends ISdk, T extends Model>(
  rec: Record<T, S>,
  property: PropertyOf<T>
): boolean {
  return rec.META.relationship(property)?.relType === "hasMany" ? true : false;
}
