import { ISdk, IModel } from "@forest-fire/types";
import { FireModelError } from "@/errors";

export class NotHasManyRelationship<S extends ISdk, T extends IModel> extends FireModelError {
  constructor(rec: Record<S, T>, property: string, method: string) {
    super("", "firemodel/not-hasMany-reln");
    this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasMany relationship`;
  }
}
