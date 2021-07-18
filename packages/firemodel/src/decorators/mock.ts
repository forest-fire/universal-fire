import { FmMockType, IFmModelPropertyMeta } from "universal-fire";

import { propertiesByModel } from "@/util";
import { propertyReflector } from "@/decorators";

export function mock(value: FmMockType, ...rest: any[]) {
  return propertyReflector<IFmModelPropertyMeta>(
    { mockType: value, mockParameters: rest },
    propertiesByModel
  );
}
