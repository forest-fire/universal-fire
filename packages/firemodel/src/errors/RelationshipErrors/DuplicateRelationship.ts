/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { FireModelError } from "@/errors";
import { IModel } from "@forest-fire/types";

export class DuplicateRelationship<T extends IModel> extends FireModelError {
  constructor(model: T, property: keyof T, fkId: string) {
    const fkConstructor = model.META.relationship("property").fkConstructor();
    const fkModel = new fkConstructor();
    const message = `Attempt add a FK on "${model.constructor.name}::${fkId}" failed because the model "${fkModel.constructor.name}::${fkId}" already had that relationship defined! You can either set the "duplicationIsError" to "false" (the default) or treat this as an error and fix`;
    super(message, "firemodel/duplicate-relationship");
  }
}
