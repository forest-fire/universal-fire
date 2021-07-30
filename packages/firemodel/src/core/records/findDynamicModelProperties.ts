import { ConstructorFor } from "common-types";
import { Model } from "~/models/Model";
import { PropertyOf } from "~/types";
import { isConstructable } from "~/util";

/**
 * Provides all of the properties -- not include `id` -- which make a unique primary
 * key for a given model.
 * 
 * Note: this is determined by the "offsets" defined for the model (specifically the _dynamic_ offsets)
 */
export function findDynamicModelProperties<T extends Model>(model: T | ConstructorFor<T>): PropertyOf<T>[] {
  const m = isConstructable(model) ? new model() : model;
  const path = m.META.dbOffset;

  if (!path.includes(":")) {
    return undefined;
  }
  const results: Array<PropertyOf<T>> = [];
  let remaining = path;
  let index = remaining.indexOf(":");

  while (index !== -1) {
    remaining = remaining.slice(index);
    const prop = remaining.replace(/:(\w+).*/, "$1");
    results.push(prop as PropertyOf<T>);
    remaining = remaining.replace(`:${prop}`, "");
    index = remaining.indexOf(":");
  }

  return results === [] ? undefined : results;
}