/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IFmModelPropertyMeta } from "~/types";
import { propertyReflector } from "~/decorators";
import { Model } from "~/models/Model";

/**
 * Allows setting a default value for a given property
 */
export function defaultValue(value: unknown) {
  return propertyReflector<IFmModelPropertyMeta<Model>>(
    { defaultValue: value }
  );
}
