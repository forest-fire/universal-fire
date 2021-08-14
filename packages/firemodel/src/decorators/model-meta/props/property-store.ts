import { IFmModelPropertyMeta, IFmModelRelationshipMeta } from "~/types";
import { IDictionary } from "common-types";
import { keys, set } from "native-dash";



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModelMetaStore = IDictionary<IFmModelPropertyMeta<any>>;

/** Properties accumlated by propertyDecorators  */
export const propertiesByModel: IDictionary<ModelMetaStore> = {};

/** allows the addition of meta information to be added to a model's properties */
export function addPropertyToModelMeta(
  modelName: string,
  property: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: IFmModelPropertyMeta<any> | IFmModelRelationshipMeta<any>
): void {
  if (!propertiesByModel[modelName]) {
    // initialize a new model
    propertiesByModel[modelName] = {};
  }

  if (typeof propertiesByModel[modelName][property] === "object" && keys(propertiesByModel[modelName][property]).length > 0) {
    for (const key of keys(meta)) {
      if (meta[key]) {
        set(propertiesByModel[modelName][property], key, meta[key]);
      }
    }
  } else {
    propertiesByModel[modelName][property] = meta;
  }

}
