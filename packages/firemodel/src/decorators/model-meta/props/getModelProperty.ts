import { ClassReflection } from "~/decorators";
import { FireModelError } from "~/errors/FireModelError";
import { IFmModelPropertyMeta } from "~/types";

/** lookup meta data for schema properties */
export function getModelProperty(klass: ClassReflection): (prop: string) => IFmModelPropertyMeta<any> {

  return (prop) => {
    if (!klass.meta[prop]) {
      throw new FireModelError(`Attempt to get the meta data for property "${prop}" failed as this is not a property on model "${klass.modelName}". Valid properties are:`, "firemodel/invalid-property")
    }

    return klass.meta[prop];
  };
}