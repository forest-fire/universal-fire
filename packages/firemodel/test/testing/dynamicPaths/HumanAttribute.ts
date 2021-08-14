import { Model, mock, model, property } from "../../../src";

@model({ dbOffset: "attributes/:category" })
export class HumanAttribute extends Model<HumanAttribute> {
  @property public attribute: string;
  @property @mock("sequence", "positive", "negative") category: string;
}
