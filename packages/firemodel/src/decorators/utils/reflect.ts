/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import "reflect-metadata";
import { ConstructorFor, IDictionary } from "common-types";
import { Model } from "~/models/Model";
import { FmPropertyType, IFmModelPropertyMeta, IFmModelRelationshipMeta } from "~/types";
import { omit } from "native-dash";
import { arrayToHash } from "typed-conversions";
import { determineType } from "~/decorators/utils/determineType";

export enum ReflectKind {
  paramTypes = "design:paramtypes",
  type = "design:type",
  returnType = "design:returntype"
}

export type Reflector<T extends Model<T> | ConstructorFor<Model<T>>> = T extends ConstructorFor<Model<T>>
  ? ClassReflection
  : T extends Model ? (prop: string) => PropertyReflection : never;

export interface ClassReflection {
  kind: "class";
  modelName: string;
  meta: IDictionary<IFmModelPropertyMeta<any> | IFmModelRelationshipMeta<any>>;
  properties: string[];
  relationships: string[];
}

export interface PropertyReflection {
  kind: "property";
  type: FmPropertyType;
  updateKeyMeta: (meta: IFmModelPropertyMeta<any> | IFmModelRelationshipMeta<any>) => void;
}

/**
 * A utility for decoractors to extract reflection data
 */
export const reflect = <
  T extends Model<T> | ConstructorFor<Model<T>>
>(model: T): Reflector<T> => {
  let result: ((prop: string) => PropertyReflection) | ClassReflection;

  if (typeof model === "function") {
    const instance = new (model as ConstructorFor<T>)();
    const propMeta = Reflect.getMetadataKeys(instance).map(i => {
      return omit(Reflect.getMetadata(i, instance), "modelName")
    });
    result = {
      kind: "class",
      modelName: instance.constructor.name,
      meta: arrayToHash(propMeta, "property") as IDictionary<IFmModelPropertyMeta<any>>,
      properties: propMeta.filter(p => p.isProperty).map(p => p.property),
      relationships: propMeta.filter(p => p.isRelationship).map(p => p.property),
    } as ClassReflection;
  } else {
    result = (prop): PropertyReflection => {
      const propType = Reflect.getMetadata(
        ReflectKind.type, model, prop as string | symbol
      ).name;
      return {
        kind: "property",
        type: determineType(propType),
        updateKeyMeta(meta) {
          const prior = (Reflect.getMetadata(prop, model) || {}) as IFmModelPropertyMeta<any> | IFmModelRelationshipMeta<any>;
          Reflect.defineMetadata(prop, { ...prior, ...meta }, model);
        }
      };
    }
  }

  return result as Reflector<T>;
}