/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { propertyReflector } from "../utils/propertyReflector";

/**
 * Provides a run-time description of a property in a model
 */
export function desc(value: string) {
  return propertyReflector(
    { desc: value }
  );
}