import { ConstructorFor } from "common-types";
import { Model } from "~/models/Model";
import { isConstructable } from "~/util";

/**
 * Higher order function which -- when presented with a Model (or constructor for one) --
 * then provides a way to check the _dynamic_ properties on the model (aka, those with 
 * offsets).
 */
export function findDynamicModelProperties<T extends Model>(model: T | ConstructorFor<T>): (keyof T & string)[] {
  const m = isConstructable(model) ? new model() : model;
  const path = m.META.dbOffset;

  if (!path.includes(":")) {
    return [];
  }
  const results: Array<keyof T & string> = [];
  let remaining = path;
  let index = remaining.indexOf(":");

  while (index !== -1) {
    remaining = remaining.slice(index);
    const prop = remaining.replace(/:(\w+).*/, "$1");
    results.push(prop as keyof T & string);
    remaining = remaining.replace(`:${prop}`, "");
    index = remaining.indexOf(":");
  }

  return results;
}