/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { FmMockType } from "~/types";
import { Model } from "~/models/Model";
import { propertyReflector } from "~/decorators/utils/propertyReflector";

export function mock(value: FmMockType<Model>, ...rest: any[]) {
  return propertyReflector(
    { mockType: value, mockParameters: rest }
  );
}
