/* eslint-disable @typescript-eslint/no-var-requires */
import { IFmChangedProperties, IModel, PropertyOf, } from "~/types";
import { Model } from "~/models/Model";
const equal = require("fast-deep-equal/es6");

export function compareHashes<T extends Model>(
  from: Partial<IModel<T>>,
  to: Partial<IModel<T>>,
  /**
   * optionally explicitly state properties so that relationships
   * can be filtered away
   */
  modelProps?: PropertyOf<T>[]
): IFmChangedProperties<T> {
  const results: IFmChangedProperties<T> = {
    added: [],
    changed: [],
    removed: [],
  };

  from = from ? from : {};
  to = to ? to : {};

  let keys = Array.from(
    new Set<PropertyOf<T>>([
      ...(Object.keys(from)),
      ...Object.keys(to),
    ] as PropertyOf<T>[])
  )
    // META should never be part of comparison
    .filter((i) => i !== "META")
    // neither should private properties indicated by underscore
    .filter((i) => i.slice(0, 1) !== "_");

  if (modelProps) {
    keys = keys.filter((i) => modelProps.includes(i));
  }

  keys.forEach((i) => {
    if (!Object.keys(to).includes(i)) {
      results.added.push(i);
    } else if (from[i as keyof typeof from] === null) {
      results.removed.push(i);
    } else if (!equal(from[i as keyof typeof from], to[i as keyof typeof to])) {
      results.changed.push(i);
    }
  });

  return results;
}
