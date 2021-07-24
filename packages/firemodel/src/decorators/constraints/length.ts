/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { propertyReflector } from "../propertyReflector";

export function length(value: number) {
  return propertyReflector(
    { length: value }
  );
}