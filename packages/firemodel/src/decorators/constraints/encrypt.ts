import { IFmModelPropertyMeta } from "~/types";
import { propertyReflector } from "~/decorators/utils";
import { Model } from "~/models/Model";

export const encrypt = propertyReflector<IFmModelPropertyMeta<Model>>(
  { encrypt: true }
);
