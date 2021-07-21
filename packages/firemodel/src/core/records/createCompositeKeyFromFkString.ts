/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ICompositeKey, isCompositeKey, IModel, } from "~/types";
import { FireModelError } from "~/errors";
import { Record } from "../Record";

export function createCompositeKeyFromFkString<T extends IModel>(
  fkCompositeRef: string,
  modelConstructor?: new () => T
): ICompositeKey<T> {
  const rec = modelConstructor ? Record.create(modelConstructor) : undefined;
  const requiredKeys = rec ? rec.dynamicPathComponents : undefined;

  if (isCompositeKey(fkCompositeRef)) {
    const [id, ...paramsHash] = fkCompositeRef.split("::");
    if (requiredKeys) {
      if (!requiredKeys.every(k => paramsHash.includes(k))) {
        throw new FireModelError(`Cannot generate a valid CompositeKey from the given FK composite reference. The required keys are: [ ${requiredKeys.join(', ')} ] but the only ones supplied were [ ${paramsHash.join(', ')} ]`)
      }
    }

    return paramsHash
      .map((i) => i.split(":"))
      .reduce(
        (acc, curr) => {
          const [prop, value] = curr as [keyof T & string, T[keyof T]];
          acc[prop] = value as T[typeof prop];
          return acc;
        },
        { id } as Partial<T>
      ) as ICompositeKey<T>;
  } else {
    return { id: fkCompositeRef } as ICompositeKey<T>
  }

}

