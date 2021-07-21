import { IModel } from "~/types";
import { ISdk } from "@forest-fire/types";
import { Record } from "~/core";
import { FireModelError } from "~/errors";

export class NotHasOneRelationship<S extends ISdk, T extends IModel> extends FireModelError {
  constructor(rec: Record<S, T>, property: string, method: string) {
    super("", "firemodel/not-hasOne-reln");
    this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasOne relationship`;
  }
}
