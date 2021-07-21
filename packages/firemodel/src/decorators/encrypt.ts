import { IFmModelPropertyMeta, IModel } from "~/types";
import { propertiesByModel } from "~/util";
import { propertyReflector } from "~/decorators";

export const encrypt = propertyReflector<IFmModelPropertyMeta<IModel>>(
  { encrypt: true },
  propertiesByModel
);
