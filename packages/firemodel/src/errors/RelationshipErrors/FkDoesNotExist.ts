import { FireModelError } from "~/errors";
import { Record } from "~/core";
import { ISdk } from "universal-fire";
import { Model } from "~/models/Model";
export class FkDoesNotExist<
  S extends ISdk,
  T extends Model
  > extends FireModelError {
  constructor(pk: Record<S, T>, property: string, fkId: string) {
    // TODO: is this typing right for constructor?
    const fkModelName = pk.META.relationship("property").fkConstructor().constructor.name;
    const message = `Attempt add a FK on of "${pk.constructor.name}::${fkId}" failed because the model "${fkModelName}::${fkId}" doesn't exist!`;
    super(message, "firemodel/fk-does-not-exist");
  }
}
