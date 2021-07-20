import { model, Model, property } from "../../src";

@model({ dbOffset: "authenticated" })
export class Concert extends Model<Concert> {
  // prettier-ignore
  @property public name: string;
  @property public employees?: number;
  @property public founded?: string;
  // prettier-ignore
  // @hasMany(() => Person) public attendees: IDictionary<fk>;
}
