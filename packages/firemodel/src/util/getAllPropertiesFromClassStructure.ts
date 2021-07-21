import { IFmModelPropertyMeta } from "~/types";
import { hashToArray } from "typed-conversions";
import { propertiesByModel } from "~/util";
import { Model } from "~/models/Model";

export function getAllPropertiesFromClassStructure<T extends Model>(model: T): IFmModelPropertyMeta<T>[] {
  const modelName: string = model.constructor.name;
  const properties: IFmModelPropertyMeta<T>[] =
    hashToArray(propertiesByModel[modelName], "property") || [];
  let parent = Object.getPrototypeOf(model.constructor);

  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(
      ...hashToArray(propertiesByModel[subClassName], "property")
    );

    parent = Object.getPrototypeOf(subClass.constructor);
  }

  return properties;
}
