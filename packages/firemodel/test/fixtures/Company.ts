import { Model } from "~/models/Model";
import { property, model, hasMany } from "~/decorators";
import { Car } from "./Car";
import { fks } from "~/types"

@model()
export class Company extends Model {
  @property public name: string;
  @property public description: string;
  @hasMany(() => Car, "make") public cars: fks;
}

