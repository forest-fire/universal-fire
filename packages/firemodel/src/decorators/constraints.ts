/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import "reflect-metadata";

import { IDictionary } from "common-types";
import { IFmModelPropertyMeta, IModel } from "@forest-fire/types";
import { propertiesByModel } from "@/util";
import { propertyReflector } from "@/decorators";

export function constrainedProperty(options: IDictionary = {}) {
  return propertyReflector<IFmModelPropertyMeta<IModel>>(
    {
      ...options,
      ...{ isRelationship: false, isProperty: true },
    },
    propertiesByModel
  );
}

/** allows the introduction of a new constraint to the metadata of a property */
export function constrain(prop: string, value: any) {
  return propertyReflector<IFmModelPropertyMeta<IModel>>(
    { [prop]: value },
    propertiesByModel
  );
}

export function desc(value: string) {
  return propertyReflector<IFmModelPropertyMeta<IModel>>(
    { desc: value },
    propertiesByModel
  );
}

export function min(value: number) {
  return propertyReflector<IFmModelPropertyMeta<IModel>>(
    { min: value },
    propertiesByModel
  );
}

export function max(value: number) {
  return propertyReflector<IFmModelPropertyMeta<IModel>>(
    { max: value },
    propertiesByModel
  );
}

export function length(value: number) {
  return propertyReflector<IFmModelPropertyMeta<IModel>>(
    { length: value },
    propertiesByModel
  );
}

export const property = propertyReflector(
  {
    isRelationship: false,
    isProperty: true,
  },
  propertiesByModel
);

export const pushKey = propertyReflector({ pushKey: true }, propertiesByModel);
