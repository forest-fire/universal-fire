/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { FmMockType } from "~/types";
import { propertyReflector } from "~/decorators/utils/propertyReflector";

export function mock<T extends unknown>(value: FmMockType<T>, ...rest: any[]) {
  return propertyReflector(
    { mockType: value, mockParameters: rest }
  );
}
