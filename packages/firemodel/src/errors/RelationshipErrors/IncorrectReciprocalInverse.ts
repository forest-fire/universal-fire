import { FireModelError, MissingReciprocalInverse } from "~/errors";
import { Record } from "~/core";
import { capitalize } from "~/util";
import { ISdk } from "@forest-fire/types";
import { Model } from "~/models/Model";
import { PropertyOf } from "~/types";
export class IncorrectReciprocalInverse<
  T extends Model,
  S extends ISdk = "RealTimeClient"
  > extends FireModelError {
  constructor(rec: Record<T, S>, property: PropertyOf<T>) {
    super("", "firemodel/missing-reciprocal-inverse");

    let message: string;
    const relationship = rec.getMetaForRelationship(property);
    const inverseProperty = rec.META.relationship(property).inverseProperty;
    if (relationship.inverseIsMissing) {
      const e = new MissingReciprocalInverse(rec, property);
      throw e;
    } else {
      const recipricalInverse = relationship.fkReciprocalInverseProperty;
      message = `The model ${rec.modelName
        } is trying to leverage it's relationship with ${capitalize(
          relationship.modelName
        )} but it appears these two models are in conflict! ${rec.modelName
        } has been defined to look for an inverse property of "${String(inverseProperty)}" but on ${relationship.modelName
        } model the inverse property points back to a property of "${recipricalInverse}"! Look at your model definitions and make sure this is addressed.`;
    }
    this.message = message;
  }
}
