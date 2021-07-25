import { Model } from "~/models/Model";
import { property, model, hasOne } from "~/decorators";
import { Company } from "./Company";

@model()
export class Car extends Model {
  @hasOne(() => Company) public make: string;
  @property public model: string;
}

