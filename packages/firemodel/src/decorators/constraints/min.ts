/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { propertyReflector } from "../utils/propertyReflector";

export function min(value: number) {
  return propertyReflector(
    { min: value }
  );
}