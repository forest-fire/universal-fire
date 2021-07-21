import { IFmModelPropertyMeta } from "~/types";
import { propertiesByModel } from "~/util";
import { propertyReflector } from "~/decorators";
import { Model } from "~/models/Model";

export const encrypt = propertyReflector<IFmModelPropertyMeta<Model>>(
  { encrypt: true },
  propertiesByModel
);
