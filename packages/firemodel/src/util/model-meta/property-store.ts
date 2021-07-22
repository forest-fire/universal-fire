import { IFmModelPropertyMeta } from "~/types";
import { Model } from "~/models/Model";
import { IDictionary } from "common-types";
import { hashToArray } from "typed-conversions";

export function isProperty<T extends Model>(modelKlass: T) {
  return (prop: string): boolean => {
    return getModelProperty(modelKlass)(prop) ? true : false;
  };
}

/** Properties accumlated by propertyDecorators  */
export const propertiesByModel: IDictionary<IDictionary<
  IFmModelPropertyMeta
>> = {};

/** allows the addition of meta information to be added to a model's properties */
export function addPropertyToModelMeta(
  modelName: string,
  property: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: IFmModelPropertyMeta<any>
): void {
  if (!propertiesByModel[modelName]) {
    propertiesByModel[modelName] = {};
  }

  propertiesByModel[modelName][property] = meta;
}

/** lookup meta data for schema properties */
export function getModelProperty<T extends Model>(model: T): (prop: string) => IFmModelPropertyMeta<T> {
  const propsForModel = getProperties(model);

  return (prop) => {
    return propsForModel.find((value) => {
      return value.property === prop;
    });
  };
}

/**
 * Gets all the properties for a given model
 *
 * @param modelConstructor the schema object which is being looked up
 */
export function getProperties<T extends Model>(model: T): IFmModelPropertyMeta<T>[] {
  const modelName = model.constructor.name;
  const properties = hashToArray(propertiesByModel[modelName], "property") || [];
  let parent = Object.getPrototypeOf(model.constructor);

  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(
      ...hashToArray(propertiesByModel[subClassName], "property")
    );

    parent = Object.getPrototypeOf(subClass.constructor);
  }

  return properties as unknown as IFmModelPropertyMeta<T>[];
}
