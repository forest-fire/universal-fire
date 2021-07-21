/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { FmMockType, IFmModelPropertyMeta, IModel } from "@/types";

import { propertiesByModel } from "@/util";
import { propertyReflector } from "@/decorators";

export function mock(value: FmMockType<IModel>, ...rest: any[]) {
  return propertyReflector<IFmModelPropertyMeta<IModel>>(
    { mockType: value, mockParameters: rest },
    propertiesByModel
  );
}
