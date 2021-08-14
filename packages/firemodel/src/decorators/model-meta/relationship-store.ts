
import { IDictionary } from "common-types";
import { IFmModelRelationshipMeta } from "~/types";


export const relationshipsByModel: IDictionary<IDictionary<
  IFmModelRelationshipMeta
>> = {};

/** allows the addition of meta information to be added to a IModel's relationships */
export function addRelationshipToModelMeta(
  IModelName: string,
  property: string,
  meta: IFmModelRelationshipMeta
): void {
  if (!relationshipsByModel[IModelName]) {
    relationshipsByModel[IModelName] = {};
  }
  // TODO: investigate why we need to genericize to IModel (from <T>)
  relationshipsByModel[IModelName][property] = meta;
}

