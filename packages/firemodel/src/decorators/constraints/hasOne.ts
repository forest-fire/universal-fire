/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  FmPropertyType,
  FmRelationshipType,
  IFmRelationshipDirectionality,
  PropertyOf,
} from "~/types";
import {
  modelConstructorLookup,
  modelNameLookup,
} from "~/util";
import { DecoratorProblem } from "~/errors/DecoratorProblem";
import { ConstructorFor } from "common-types";
import { Model } from "~/models/Model";
import { propertyReflector } from "~/decorators/utils/propertyReflector";


export function belongsTo<T extends Model = Model>(
  /**
   * either a _string_ representing the Model's class name
   * or a _constructor_ for the Model class.
   *
   * In order to support prior implementations we include the
   * possibility that a user of this API will pass in a _function_
   * to a _constructor_. This approach is now deprecated.
   */
  fkClass: ConstructorFor<T> | (() => ConstructorFor<T>) | string,
  inverse?: PropertyOf<T> | [PropertyOf<T>, IFmRelationshipDirectionality]
) {
  try {
    const fkConstructor: () => ConstructorFor<T> =
      typeof fkClass === "string"
        ? modelNameLookup(fkClass)
        : modelConstructorLookup(fkClass);

    let inverseProperty: string & keyof T | null;
    let directionality: IFmRelationshipDirectionality;
    if (Array.isArray(inverse)) {
      [inverseProperty, directionality] = inverse;
    } else {
      inverseProperty = inverse;
      directionality = inverse ? "bi-directional" : "one-way";
    }


    return propertyReflector({
      isRelationship: true,
      isProperty: false,
      relType: FmRelationshipType.hasOne,
      inverseProperty,
      directionality,
      fkConstructor,
      hasInverse: inverseProperty !== undefined ? true : false,
      type: FmPropertyType.string
    }
    );
  } catch (e) {
    throw new DecoratorProblem("hasOne", e, { inverse });
  }
}

export const ownedBy = belongsTo;
export const hasOne = belongsTo;
