/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IFmModelPropertyMeta } from "~/types";
import { propertyReflector } from "../propertyReflector";

export function constrainedProperty(options: Partial<Omit<IFmModelPropertyMeta<any>, "type" | "property">> = {}) {
  return propertyReflector({ ...options, isRelationship: false, isProperty: true });
}
