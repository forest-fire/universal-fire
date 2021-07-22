/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { FmMockType, IFmModelPropertyMeta } from "~/types";
import { Model } from "~/models/Model";

import { propertiesByModel } from "~/util";
import { propertyReflector } from "~/decorators";

export function mock(value: FmMockType<Model>, ...rest: any[]) {
  return propertyReflector<IFmModelPropertyMeta<any>>(
    { mockType: value, mockParameters: rest },
    propertiesByModel
  );
}
