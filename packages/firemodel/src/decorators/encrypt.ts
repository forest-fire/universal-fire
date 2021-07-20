import { IFmModelPropertyMeta, IModel } from "@forest-fire/types";
import { propertiesByModel } from "@/util";
import { propertyReflector } from "@/decorators";

export const encrypt = propertyReflector<IFmModelPropertyMeta<IModel>>(
  { encrypt: true },
  propertiesByModel
);
