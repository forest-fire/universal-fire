/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ConstructorFor, IDictionary } from "common-types";
import {
  IFmRelationshipDirectionality,
  FmPropertyType,
  FmRelationshipType
} from "~/types";
import { modelConstructorLookup, modelNameLookup } from "~/util";

import { DecoratorProblem } from "~/errors";
import { propertyReflector } from "~/decorators/utils/propertyReflector";

import { Model } from "~/models/Model";

export type IFmHasMany<T = true> = IDictionary<T>;

export function hasMany<T extends Model>(
  /**
   * either a _string_ representing the Model's class name
   * or a _constructor_ for the Model class
   *
   * In order to support prior implementations we include the
   * possibility that a user of this API will pass in a _function_
   * to a _constructor_. This approach is now deprecated.
   */
  fkClass:
    | ConstructorFor<T>
    | (() => ConstructorFor<T>)
    | (() => ConstructorFor<T>)
    | string,
  inverse?:
    | string
    | (string & keyof T)
    | [string & keyof T, IFmRelationshipDirectionality]
) {
  try {
    const fkConstructor: () => ConstructorFor<T> =
      typeof fkClass === "string"
        ? modelNameLookup(fkClass)
        : modelConstructorLookup(
            fkClass as ConstructorFor<T> | (() => ConstructorFor<T>)
          );

    let inverseProperty: (string & keyof T) | undefined;
    let directionality: IFmRelationshipDirectionality;
    if (Array.isArray(inverse)) {
      [inverseProperty, directionality] = inverse;
    } else {
      inverseProperty = inverse as string & keyof T;
      directionality = inverse ? "bi-directional" : "one-way";
    }

    return propertyReflector({
      isRelationship: true,
      isProperty: false,
      relType: FmRelationshipType.hasMany,
      directionality,
      fkConstructor,
      inverseProperty,
      hasInverse: inverseProperty !== undefined ? true : false,
      type: FmPropertyType.object,
    });
  } catch (e) {
    throw new DecoratorProblem("hasMany", e, { inverse });
  }
}
