import { ClassReflection } from "~/decorators/utils";
import { IModelIndexMeta } from "~/types/property-meta/IModelIndexMeta";

/**
 * Gets all the db indexes for a given model
 */
export function getDbIndexes(klass: ClassReflection): IModelIndexMeta[] {
  return Object.entries(klass.meta)
    .filter(([_, r]) => r.isIndex)
    .map(([_, r]) => ({
      isIndex: r.isIndex ? true : false,
      isUniqueIndex: r.isUniqueIndex ? true : false,
      isMultiEntryIndex: r.isMultiEntryIndex ? true : false,
      property: r.property,
      desc: r.desc,
    }));
}