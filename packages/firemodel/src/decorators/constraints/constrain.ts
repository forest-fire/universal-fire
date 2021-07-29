/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IFmModelPropertyMeta } from "~/types";
import { propertyReflector } from "~/decorators/utils/propertyReflector";
import { Model } from "~/models";

/** allows the introduction of a new constraint to the metadata of a property */
export function constrain<
  C extends Partial<Omit<IFmModelPropertyMeta<any>, "type" | "property">>,
  D extends keyof C
>(prop: D, value: C[D]) {
  return propertyReflector({ [prop]: value });
}
