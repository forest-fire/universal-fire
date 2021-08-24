import { ISdk } from "@forest-fire/types";
import { Record } from "~/core";
import { FireModelError } from "~/errors";
import { capitalize } from "~/util";
import { Model } from "~/models/Model";
import { PropertyOf } from "~/types";

/**
 * When the record's META points to a inverse property on the FK; this error
 * presents when that `FK[inverseProperty]` doesn't exist in the FK's meta.
 */
export class MissingInverseProperty<
  T extends Model,
  S extends ISdk = "RealTimeClient"
> extends FireModelError {
  public from: string;
  public to: string;
  public inverseProperty: string;

  constructor(rec: Record<T, S>, property: PropertyOf<T>) {
    super("", "firemodel/missing-inverse-property");

    const fkMeta = rec.getMetaForRelationship(property);

    this.from = capitalize(rec.modelName);
    this.to = capitalize(fkMeta.modelName);
    const pkInverse = rec.META.relationship(property).inverseProperty;
    this.inverseProperty = pkInverse;

    const message = `Missing Inverse Property: the model "${
      this.from
    }" has defined a relationship with the "${
      this.to
    }" model where the FK property is "${property}" and it states that the "inverse property" is "${String(
      pkInverse
    )}" on the ${this.to} model. Unfortunately the ${
      this.to
    } model does NOT define a property called "${this.inverseProperty}".`;
    this.message = message;
  }
}
