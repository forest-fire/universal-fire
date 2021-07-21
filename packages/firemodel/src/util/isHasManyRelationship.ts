import { IModel, ISdk } from "@forest-fire/types";
import { Record } from "@/core";

export function isHasManyRelationship<S extends ISdk, T extends IModel>(
  rec: Record<S, T>,
  property: keyof T & string
): boolean {
  return rec.META.relationship(property)?.relType === "hasMany" ? true : false;
}
