import { IModel, ISdk } from "@forest-fire/types";
import { IRecord } from "@/types";
import { FireModelError } from "@/errors";

export class NotHasOneRelationship<S extends ISdk, T extends IModel> extends FireModelError {
  constructor(rec: IRecord<S, T>, property: string, method: string) {
    super("", "firemodel/not-hasOne-reln");
    this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasOne relationship`;
  }
}
