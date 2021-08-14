import {
  model,
  Model,
  property,
  fk,
  min,
  belongsTo,
  hasMany,
  mock,
  fks
} from "~/index";
import { Company } from "./Company";
import { Car } from "./Car";

@model({ dbOffset: "authenticated" })
export class FancyPerson extends Model {
  @property public name: string;
  // prettier-ignore
  @property @min(0) public age?: number;
  @property public phoneNumber?: string;
  // prettier-ignore
  @property @mock("phoneNumber") public otherPhone?: string;
  // prettier-ignore
  @property @mock(h => h.name.firstName() + ", hello to you") public foobar?: string;
  // prettier-ignore
  @belongsTo(() => Company) public employer?: fk;
  // prettier-ignore
  @hasMany(() => Car, "owner") public cars?: fks;
  // prettier-ignore
  @hasMany(() => FancyPerson, "children") public parents?: fks;
  // prettier-ignore
  @hasMany(() => FancyPerson, "parents") public children?: fks;
}