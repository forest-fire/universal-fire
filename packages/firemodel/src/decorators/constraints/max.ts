/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { propertyReflector } from "../utils/propertyReflector";

export function max(value: number) {
  return propertyReflector(
    { max: value },
  );
}