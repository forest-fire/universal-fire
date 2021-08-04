/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassReflection } from "~/decorators/utils";
import { FireModelError } from "~/errors/FireModelError";
import { IFmModelRelationshipMeta } from "~/types/property-meta";

export function getModelRelationship(klass: ClassReflection): (prop: string) => IFmModelRelationshipMeta<any> {

  return (prop) => {
    if (!klass.meta[prop]) {
      throw new FireModelError(`Attempt to get the meta data for a relationship on "${klass.modelName}::${prop}" failed as this is no property with that name "${klass.modelName}". Valid properties are:`, "firemodel/invalid-property")
    }
    if (!klass.relationships.includes(prop)) {
      throw new FireModelError(`Attempt to get the meta data for a relationship on "${klass.modelName}::${prop}" failed as "${prop}" is defined as a property not a relationship!`, "firemodel/invalid-property")
    }

    return klass.meta[prop] as IFmModelRelationshipMeta<any>;
  };
}