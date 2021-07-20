/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IFmModelPropertyMeta, IModel } from "universal-fire";
import { propertiesByModel } from "@/util";
import { propertyReflector } from "@/decorators";

// TODO: make the defaultValue typed
/**
 * Allows setting a default value for a given property
 */
export function defaultValue(value: any) {
  return propertyReflector<IFmModelPropertyMeta<IModel>>(
    { defaultValue: value },
    propertiesByModel
  );
}