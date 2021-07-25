import { ClassReflection } from "~/decorators/utils";
import { IModelIndexMeta } from "~/types/property-meta/IModelIndexMeta";
import { getRelationships } from "./getRelationships";

/**
 * Gets all the db indexes for a given model
 */
export function getDbIndexes(klass: ClassReflection): IModelIndexMeta[] {
  return getRelationships(klass).filter(r => r.isIndex).map(r => ({
    isIndex: r.isIndex ? true : false,
    isUniqueIndex: r.isUniqueIndex ? true : false,
    isMultiEntryIndex: r.isMultiEntryIndex ? true : false,
    property: r.property,
    desc: r.desc
  }));


}