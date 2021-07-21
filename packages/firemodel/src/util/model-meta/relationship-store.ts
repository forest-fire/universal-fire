
import { Model } from "~/models/Model";
import { IDictionary } from "common-types";
import { hashToArray } from "typed-conversions";
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

export function isRelationship<T extends Model>(IModelKlass: T): (prop: string) => boolean {
  return (prop) => {
    return getModelRelationship(IModelKlass)(prop) ? true : false;
  };
}

export function getModelRelationship<T extends Model>(IModel: T): (path: string) => IFmModelRelationshipMeta<T> {
  const relnsForIModel = getRelationships(IModel);

  return (prop) => {
    const f = relnsForIModel.find((value) => {
      return value.property === prop;
    });
    return f as unknown as IFmModelRelationshipMeta<T>
  };
}

/**
 * Gets all the relationships for a given IModel
 */
export function getRelationships<T extends Model>(IModel: T): IFmModelRelationshipMeta[] {
  const IModelName = IModel.constructor.name;
  const properties =
    hashToArray(relationshipsByModel[IModelName], "property") || [];
  let parent = Object.getPrototypeOf(IModel.constructor);

  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(
      ...hashToArray(relationshipsByModel[subClassName], "property")
    );

    parent = Object.getPrototypeOf(subClass.constructor);
  }

  return properties;
}
