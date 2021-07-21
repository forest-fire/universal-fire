
import { Model } from "~/models/Model";
import { IDictionary } from "common-types";
import { hashToArray } from "typed-conversions";
import { IFmModelRelationshipMeta } from "~/types";

export const relationshipsByModel: IDictionary<IDictionary<
  IFmModelRelationshipMeta
>> = {};

/** allows the addition of meta information to be added to a IModel's relationships */
export function addRelationshipToModelMeta<T extends {}>(
  IModelName: string,
  property: string,
  meta: IFmModelRelationshipMeta<T>
) {
  if (!relationshipsByModel[IModelName]) {
    relationshipsByModel[IModelName] = {};
  }
  // TODO: investigate why we need to genericize to IModel (from <T>)
  relationshipsByModel[IModelName][property] = meta as IFmModelRelationshipMeta<
    any
  >;
}

export function isRelationship<T extends {}>(IModelKlass: T) {
  return (prop: string) => {
    return getModelRelationship(IModelKlass)(prop) ? true : false;
  };
}

export function getModelRelationship<T extends Model>(IModel: T) {
  const relnsForIModel = getRelationships(IModel);
  const className = IModel.constructor.name;

  return (prop: string) => {
    return relnsForIModel.find((value) => {
      return value.property === prop;
    });
  };
}

/**
 * Gets all the relationships for a given IModel
 */
export function getRelationships<T extends {}>(IModel: T) {
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
