import { Model } from "~/models/Model";
import { property, model } from "~/decorators";

@model()
export class SimpleCar extends Model {
  @property public make: string;
  @property public model: string;
}

