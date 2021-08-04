/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  ForeignKey,
  ICompositeKey,
  isCompositeKey,
  isCompositeString,
  PrimaryKey,
  PropertyOf,
} from "~/types";
import { FireModelError } from "~/errors";
import { Model } from "~/models/Model";
import { findDynamicModelProperties } from "./findDynamicModelProperties";
import { ConstructorFor } from "common-types";
import { keys } from "native-dash";

function validate<T extends Model>(
  composite: ICompositeKey<T>,
  requiredKeys?: PropertyOf<T>[],
  ignoreExtraneous = false
) {
  const compositeKeys = keys(composite);

  if (requiredKeys && requiredKeys.length === 1 && requiredKeys[0] === "id") {
    if (compositeKeys.filter(i => i !== "id").length > 0 && requiredKeys && requiredKeys.length > 0) {
      throw new FireModelError(`The model passed in has a PK of just the "id" property but other extraneous keys were passed in! Keys passed in were: ${compositeKeys.join(", ")}`, "firemodel/invalid-composite-key")
    }
    return composite;
  }

  if (!ignoreExtraneous && requiredKeys && !compositeKeys.every(k => requiredKeys && requiredKeys.includes(k as PropertyOf<T>))) {
    throw new FireModelError(`While building a CompositeKey, extraneous properties not involved in the model were found!\nThe required keys for the model are: ${requiredKeys ? requiredKeys.join(", ") : "unknown"},\nwhereas the keys provided were: ${compositeKeys.join(", ")}`, "firemodel/invalid-composite-key")
  }

  if (requiredKeys && !requiredKeys.every(k => compositeKeys.includes(k))) {
    throw new FireModelError(`While building a CompositeKey with known required keys, the values were incomplete!\n\nThe required keys for the model are: ${requiredKeys.join(", ")},\nwhereas the keys provided were: ${compositeKeys.join(", ")}`, "firemodel/invalid-composite-key")
  }

  return composite;
}

/**
 * Converts a string representation of a `PrimaryKey` or `ForeignKey` to
 * an object notation of `ICompositeKey`. 
 * 
 * If you have the model or it's constructor then the properties passed in
 * will be validated for completeness and an error thrown if not all are
 * available.
 */
export function createCompositeKey<T extends Model>(
  key: ForeignKey<T> | PrimaryKey<T>,
  model?: T | ConstructorFor<T>,
  ignoreExtraneous = false
): ICompositeKey<T> {
  const requiredKeys = model ? ["id", ...findDynamicModelProperties(model)] as PropertyOf<T>[] : undefined;

  if (isCompositeKey(key)) {
    return validate<T>(key, requiredKeys);
  } else if (isCompositeString(key)) {
    const [id, ...paramsHash] = key.split("::");
    const composite = paramsHash
      .map((i) => i.split(":"))
      .reduce(
        (acc, curr) => {
          const [prop, value] = curr;
          acc[prop as keyof typeof acc] = value;
          return acc;
        },
        { id }
      ) as ICompositeKey<T>;

    return validate<T>(composite, requiredKeys, ignoreExtraneous);
  } else {
    return validate<T>({ id: key } as ICompositeKey<T>, requiredKeys, ignoreExtraneous);
  }
}
