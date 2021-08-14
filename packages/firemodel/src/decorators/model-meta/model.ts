/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import "reflect-metadata";

import {
  addModelMeta,
  modelRegister
} from "~/util";

import { ConstructorFor } from "common-types";
import { reflect } from "~/decorators";
import { IFmModelMeta, PropertyOf } from "~/types";
import { Model } from "~/models/Model";
import { getModelProperty, getProperties, isProperty, getPushKeys } from "~/decorators/model-meta/props";
import { getDbIndexes, getModelRelationship, getRelationships, isRelationship } from "~/decorators/model-meta/relns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function model(options: Partial<IFmModelMeta<any>> = {}) {

  return function decorateModel<M extends Model>(
    target: ConstructorFor<M>
  ) {
    const r = reflect(target);

    // Function to add META to the model
    function addMetaProperty() {


      // Build the model's META property
      const meta: IFmModelMeta<M> = {
        modelName: r.modelName,
        ...options,
        isProperty: isProperty(r),
        property: getModelProperty(r),
        properties: getProperties(r),
        isRelationship: isRelationship(r),
        relationship: getModelRelationship(r),
        relationships: getRelationships(r),
        dbIndexes: getDbIndexes(r),
        pushKeys: getPushKeys(r),
        dbOffset: options.dbOffset ? options.dbOffset : "",
        plural: options.plural,
        allProperties: [...r.properties, ...r.relationships] as PropertyOf<M>[],
        ...{
          localPostfix:
            options.localPostfix === undefined ? "all" : options.localPostfix,
        },
        ...{
          localModelName:
            options.localModelName === undefined
              ? r.modelName.slice(0, 1).toLowerCase() + r.modelName.slice(1)
              : options.localModelName,
        },
      };

      // add the META to the registry
      addModelMeta(r.modelName.toLowerCase(), meta);
      // assign the META property to the class
      Object.defineProperty(target.prototype, "META", {
        get(): IFmModelMeta<M> {
          return meta;
        },
        set() {
          throw new Error(
            "The META properties should only be set with the @model decorator at design time!"
          );
        },
        configurable: false,
        enumerable: false,
      });

      if (target) {
        // register the constructor so name based lookups will succeed
        modelRegister(target);
      }

      return target;
    }

    // copy prototype so intanceof operator still works
    addMetaProperty.prototype = target.prototype;

    // return new constructor (will override original)
    return addMetaProperty();
  };
}
