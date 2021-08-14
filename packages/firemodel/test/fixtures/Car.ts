import { Model } from "~/models/Model";
import { property, model, hasOne } from "~/decorators";
import { Company } from "./Company";


@model()
export class Car extends Model<Car> {
  @hasOne(() => Company) public make: string;
  @property public model: string;
}
