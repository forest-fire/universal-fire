import { ClassReflection } from "~/decorators/utils";
import { IFmModelPropertyMeta } from "~/types";

/**
 * Gets all the properties for a given model
 *
 * @param modelConstructor the schema object which is being looked up
 */
export function getProperties(model: ClassReflection): IFmModelPropertyMeta<any>[] {
  const result: IFmModelPropertyMeta<any>[] = [];
  for (const key of model.properties) {
    result.push(model.meta[key]);
  }

  return result;
}