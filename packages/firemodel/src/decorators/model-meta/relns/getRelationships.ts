import { ClassReflection } from "~/decorators/utils";
import { IFmModelRelationshipMeta } from "~/types/property-meta";
import { getModelRelationship } from "./getModelRelationship";
/**
 * An array of all relationships on a given model
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRelationships(klass: ClassReflection): IFmModelRelationshipMeta<any, any>[] {
  return klass.relationships.map(i => getModelRelationship(klass)(i));
}