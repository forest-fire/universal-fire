import "reflect-metadata";

import {
  IFmModelPropertyMeta,
  IFmModelRelationshipMeta,
  IModel,
} from "~/types";
import { addPropertyToModelMeta, addRelationshipToModelMeta } from "~/util";
import { Model } from "~/models/Model";
import { IDictionary } from "common-types";

export const propertyDecorator = <T extends Model>(
  nameValuePairs: IDictionary = {},
  /**
   * if you want to set the property being decorated's name
   * as property on meta specify the meta properties name here
   */
  property?: string
) => (target: IModel, key: string): void => {
  const reflect: IDictionary =
    Reflect.getMetadata("design:type", target, key) || {};

  if (nameValuePairs.isProperty) {
    const meta: IFmModelPropertyMeta<T> = {
      ...Reflect.getMetadata(key, target),
      ...{ type: reflect.name },
      ...nameValuePairs,
    };
    Reflect.defineMetadata(key, meta, target);
    addPropertyToModelMeta(target.constructor.name, property, meta);
  }

  if (nameValuePairs.isRelationship) {
    const meta: IFmModelRelationshipMeta = {
      ...Reflect.getMetadata(key, target),
      ...{ type: reflect.name },
      ...nameValuePairs,
    };
    Reflect.defineMetadata(key, meta, target);
    addRelationshipToModelMeta(target.constructor.name, property, meta);
  }
};
