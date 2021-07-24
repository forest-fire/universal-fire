import { propertyReflector } from "../propertyReflector";

export function max(value: number) {
  return propertyReflector(
    { max: value },
  );
}