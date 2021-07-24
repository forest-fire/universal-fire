/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { propertyReflector } from "../propertyReflector";

export function min(value: number) {
  return propertyReflector(
    { min: value }
  );
}