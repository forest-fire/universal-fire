/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import "reflect-metadata";

import {
  addModelMeta,
  getModelProperty,
  getModelRelationship,
  getProperties,
  getRelationships,
  isProperty,
  isRelationship,
  getPushKeys,
  modelRegister
} from "~/util";

import { ConstructorFor } from "common-types";
import { getDbIndexes } from "~/decorators";
import { IFmModelMeta } from "~/types";
import { Model } from "~/models/Model";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function model(options: Partial<IFmModelMeta<any>> = {} as Partial<IFmModelMeta<any>>) {

  return function decorateModel<M extends Model>(
    target: ConstructorFor<M>
  ) {
    // Function to add META to the model
    function addMetaProperty() {
      const instance = new target();

      if (options.audit === undefined) {
        options.audit = false;
      }
      if (
        !(
          options.audit === true ||
          options.audit === false ||
          options.audit === "server"
        )
      ) {
        console.log(
          `The audit property was set as "${JSON.stringify(options.audit)}" which is invalid. Valid properties are true, false, and "server". The audit property will be set to false for now.`
        );
        options.audit = false;
      }

      const meta: IFmModelMeta<M> = {
        ...options,
        ...{ isProperty: isProperty(instance) },
        ...{ property: getModelProperty(instance) },
        ...{ properties: getProperties(instance) },
        ...{ isRelationship: isRelationship(instance) },
        ...{ relationship: getModelRelationship(instance) },
        ...{ relationships: getRelationships(instance) },
        ...{ dbIndexes: getDbIndexes(target) },
        ...{ pushKeys: getPushKeys(instance) },
        ...{ dbOffset: options.dbOffset ? options.dbOffset : "" },
        ...{ audit: options.audit ? options.audit : false },
        ...{ plural: options.plural },
        ...{
          allProperties: [
            ...getProperties(instance).map(i => i.property),
            ...getRelationships(instance).map(i => i.property),
          ],
        },
        ...{
          localPostfix:
            options.localPostfix === undefined ? "all" : options.localPostfix,
        },
        ...{
          localModelName:
            options.localModelName === undefined
              ? instance.constructor.name.slice(0, 1).toLowerCase() +
              instance.constructor.name.slice(1)
              : options.localModelName,
        },
      };

      addModelMeta(target.constructor.name.toLowerCase(), meta);

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
