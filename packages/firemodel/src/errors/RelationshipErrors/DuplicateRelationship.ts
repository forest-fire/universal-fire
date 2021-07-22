/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { FireModelError } from "~/errors";
import { Model } from "~/models/Model";

export class DuplicateRelationship<T extends Model> extends FireModelError {
  constructor(model: T, property: keyof T, fkId: string) {
    const fkModelName = model.META.relationship("property").fkConstructor().constructor.name;
    const message = `Attempt add a FK on "${fkModelName}::${fkId}" failed because the model "${fkModelName}::${fkId}" already had that relationship defined! You can either set the "duplicationIsError" to "false" (the default) or treat this as an error and fix`;
    super(message, "firemodel/duplicate-relationship");
  }
}
