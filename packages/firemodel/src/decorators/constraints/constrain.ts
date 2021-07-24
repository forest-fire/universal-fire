/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IFmModelPropertyMeta } from "~/types";
import { propertyReflector } from "../propertyReflector";

/** allows the introduction of a new constraint to the metadata of a property */
export function constrain(prop: string, value: Partial<Omit<IFmModelPropertyMeta<any>, "type" | "property">>) {
  return propertyReflector(
    { [prop]: value }
  );
}