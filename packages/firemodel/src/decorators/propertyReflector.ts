import "reflect-metadata";
import { get, set } from "native-dash";
import { IDictionary } from "common-types";
import { lowercase } from "~/util/shared";
import { Model } from "~/models/Model";
import { IFmModelPropertyMeta } from "~/types";

/**
 * A higher order function used by other decorators to provide the core decoration of
 * property attributes.
 * ```ts
 * // decorator with options hash
 * const min = (value: number) => propertyReflector({ min: value });
 * // decorator with no options
 * const property = propertyReflector({ isRelationship: false, isProperty: true });
 * ```
 */
export const propertyReflector = <O extends IFmModelPropertyMeta<Model>>(options: Partial<O> = {}) => <TModel extends Model, TProp extends keyof TModel>(modelKlass: TModel, key: TProp): void => {
  const modelName = modelKlass.constructor.name;

  const classReflection = Reflect.getMetadata("design:type", modelKlass) || {};
  const propertyReflection = Reflect.getMetadata("design:type", modelKlass, key as string) || {};
  const propertyReflection2 = Reflect.getMetadata("model:prop", modelKlass, key as string) || {};
  console.log({ key, class: classReflection, prop: propertyReflection, prop2: propertyReflection2 });

  const propMeta = {
    type: lowercase(classReflection.name),
    ...propertyReflection,
    property: key,
  } as IFmModelPropertyMeta<any>;

  Reflect.defineMetadata(key, propMeta, modelKlass);

  // if (modelRollup) {
  //   const modelAndProp = modelName + "." + key;

  //   set(modelRollup, modelAndProp, {
  //     ...get(modelRollup, modelAndProp),
  //     ...propMeta,
  //   });
  // }
};
