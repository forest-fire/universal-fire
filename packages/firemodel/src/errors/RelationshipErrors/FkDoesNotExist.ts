import { FireModelError } from "@/errors";
import { IModel, isModelClass } from "@/types";
import { Record } from "@/core";
import { ISdk } from "universal-fire";

export class FkDoesNotExist<
  S extends ISdk,
  T extends IModel
  > extends FireModelError {
  constructor(pk: Record<S, T>, property: string, fkId: string) {
    // TODO: is this typing right for constructor?
    const fkModelName = isModelClass(pk) ? pk.META.relationship("property").fkConstructor().constructor.name : "unknown";
    const message = `Attempt add a FK on of "${pk.constructor.name}::${fkId}" failed because the model "${fkModelName}::${fkId}" doesn't exist!`;
    super(message, "firemodel/fk-does-not-exist");
  }
}
