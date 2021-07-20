import { IFmHasOne } from "../../../types/dist/types/@types";
import { model, property, Model, belongsTo } from "../../src";
import { Person } from "./Person";

@model({ dbOffset: "pay-offset", audit: true })
export class Pay extends Model<Pay> {
  // prettier-ignore
  @belongsTo(() => Person) public employee?: IFmHasOne;
  @property public amount?: string;
}
