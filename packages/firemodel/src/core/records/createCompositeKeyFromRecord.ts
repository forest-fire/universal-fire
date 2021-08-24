import { ICompositeKey } from "~/types";
import { FireModelError } from "~/errors";
import { Record } from "~/core";
import { capitalize } from "~/util";
import { ISdk } from "@forest-fire/types";
import { Model } from "~/models/Model";

/**
 * Given a `Record` which defines all properties in it's
 * "dynamic segments" as well as an `id`; this function returns
 * an object representation of the composite key.
 */
export function createCompositeKeyFromRecord<
  T extends Model = Model,
  S extends ISdk = "RealTimeClient"
>(rec: Record<T, S>): ICompositeKey<T> {
  const model = rec.data;
  if (!rec.id) {
    throw new FireModelError(
      `You can not create a composite key without first setting the 'id' property!`,
      "firemodel/not-ready"
    );
  }
  const dynamicPathComponents = rec.dynamicPathComponents.reduce(
    (prev, key) => {
      if (!model[key as keyof typeof model]) {
        throw new FireModelError(
          `You can not create a composite key on a ${capitalize(
            rec.modelName
          )} without first setting the '${key}' property!`,
          "firemodel/not-ready"
        );
      }
      return {
        ...prev,
        ...{ [key]: model[key as keyof typeof model] },
      };
    },
    {}
  );

  return rec.dynamicPathComponents.reduce(
    (prev) => ({
      ...prev,
      ...dynamicPathComponents,
    }),
    { id: rec.id }
  ) as ICompositeKey<T>;
}
