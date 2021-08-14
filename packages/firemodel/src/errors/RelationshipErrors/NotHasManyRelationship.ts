import { ISdk } from "@forest-fire/types";
import { Record } from "~/core";
import { FireModelError } from "~/errors";
import { Model } from "~/models/Model";
export class NotHasManyRelationship<S extends ISdk, T extends Model> extends FireModelError {
  constructor(rec: Record<S, T>, property: string, method: string) {
    super("", "firemodel/not-hasMany-reln");
    this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasMany relationship`;
  }
}
