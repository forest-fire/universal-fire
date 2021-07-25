import "reflect-metadata";
import { Model } from "~/models/Model";
import { IFmModelPropertyMeta, IFmModelRelationshipMeta } from "~/types";
import { reflect } from "./reflect";

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
export const propertyReflector = <O extends IFmModelPropertyMeta<Model> | IFmModelRelationshipMeta<Model>>(options: Partial<O> = {}) => <TModel extends Model, TProp extends keyof TModel & string>(modelKlass: TModel, key: TProp): void => {
  const r = reflect(modelKlass)(key);
  const modelName = modelKlass.constructor.name;

  r.updateKeyMeta({
    modelName,
    type: r.type,
    ...options,
    property: key,
  });

};
