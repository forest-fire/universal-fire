/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import "reflect-metadata";

import { IDictionary } from "common-types";
import { IFmModelPropertyMeta } from "~/types";
import { propertiesByModel } from "~/util";
import { propertyReflector } from "~/decorators";
import { Model } from "~/models/Model";

export function constrainedProperty(options: IDictionary = {}) {
  return propertyReflector<IFmModelPropertyMeta<Model>>(
    {
      ...options,
      ...{ isRelationship: false, isProperty: true },
    },
    propertiesByModel
  );
}

/** allows the introduction of a new constraint to the metadata of a property */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function constrain(prop: string, value: any) {
  return propertyReflector<IFmModelPropertyMeta<Model>>(
    { [prop]: value },
    propertiesByModel
  );
}

export function desc(value: string) {
  return propertyReflector<IFmModelPropertyMeta<Model>>(
    { desc: value },
    propertiesByModel
  );
}

export function min(value: number) {
  return propertyReflector<IFmModelPropertyMeta<Model>>(
    { min: value },
    propertiesByModel
  );
}

export function max(value: number) {
  return propertyReflector<IFmModelPropertyMeta<Model>>(
    { max: value },
    propertiesByModel
  );
}

export function length(value: number) {
  return propertyReflector<IFmModelPropertyMeta<Model>>(
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
