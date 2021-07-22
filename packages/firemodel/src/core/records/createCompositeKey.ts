/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ForeignKey, ICompositeKey, isCompositeKey, isCompositeString, PrimaryKey, PropertyOf, } from "~/types";
import { FireModelError } from "~/errors";
import { Model } from "~/models/Model";
import { findDynamicModelProperties } from "./findDynamicModelProperties";
import { ConstructorFor } from "common-types";
import { keys } from "native-dash";

function validate<T extends Model>(composite: ICompositeKey<T>, requiredKeys?: PropertyOf<T>[]) {
  if (!requiredKeys) {
    return composite;
  }
  const compositeKeys = keys(composite);

  if (!requiredKeys.every(k => compositeKeys.includes(k)) || requiredKeys.length !== compositeKeys.length) {
    throw new FireModelError(`Cannot generate a valid CompositeKey from the given FK composite reference. The required keys are: [ ${requiredKeys.join(', ')} ] but the only ones supplied were [ ${compositeKeys.join(', ')} ]`)
  } else {
    return composite;
  }
}

/**
 * Converts a string representation of a `PrimaryKey` or `ForeignKey` to
 * an object notation of `ICompositeKey`. If you have the model or it's
 * constructor then it will be validated that all properties are populated
 */
export function createCompositeKey<T extends Model>(
  key: ForeignKey<T> | PrimaryKey<T>,
  model?: T | ConstructorFor<T>
): ICompositeKey<T> {
  const requiredKeys = model ? findDynamicModelProperties(model) : undefined;

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
    return validate<T>(composite, requiredKeys);
  } else {
    return validate<T>({ id: key } as ICompositeKey<T>, requiredKeys)
  }
}
