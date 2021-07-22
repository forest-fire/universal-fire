/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IFmModelPropertyMeta } from "~/types";
import { propertiesByModel } from "~/util";
import { propertyReflector } from "~/decorators";
import { Model } from "~/models/Model";

// TODO: make the defaultValue typed
/**
 * Allows setting a default value for a given property
 */
export function defaultValue(value: unknown) {
  return propertyReflector<IFmModelPropertyMeta<Model>>(
    { defaultValue: value },
    propertiesByModel
  );
}
