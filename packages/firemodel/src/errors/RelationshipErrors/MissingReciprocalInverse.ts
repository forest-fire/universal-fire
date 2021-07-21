import { ISdk } from "@forest-fire/types";
import { Record } from "@/core";
import { FireModelError } from "@/errors";
import { IModel } from "@/types";
import { capitalize } from "@/util";

export class MissingReciprocalInverse<S extends ISdk, T extends IModel> extends FireModelError {
  constructor(rec: Record<S, T>, property: keyof T & string) {
    super("", "firemodel/missing-reciprocal-inverse");
    const fkMeta = rec.getMetaForRelationship(property);

    const message = `The model "${capitalize(
      rec.modelName
    )}" is trying to leverage it's relationship with the model "${capitalize(
      fkMeta.modelName
    )}" through the property "${property}" but it appears these two models definitions are in conflict. ${capitalize(
      rec.modelName
    )} has been defined to look for an inverse property of "${capitalize(
      fkMeta.modelName
    )}.${String(rec.META.relationship(property).inverseProperty)}" but it is not defined (or not defined as a relationship) on the ${capitalize(
      fkMeta.modelName
    )}! Look at your model definitions and make sure this is addressed.`;
    this.message = message;
  }
}
