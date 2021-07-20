import { IModel, IFmModelMeta, IModelProps } from "@forest-fire/types";
import { hashToArray } from "typed-conversions";
import { propertiesByModel } from "@/util";

export function getAllPropertiesFromClassStructure<T extends IModel<P>, P extends IModelProps>(model: T): IFmModelMeta<P>["property"][] {
  const modelName: string = model.constructor.name;
  const properties: IFmModelMeta<P>["property"][] =
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
