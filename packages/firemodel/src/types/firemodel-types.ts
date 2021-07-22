import { Model } from "~/models/Model";
import { PropertyOf } from "./models";

export interface IFmChangedProperties<T extends Model> {
  added: PropertyOf<T>[];
  changed: PropertyOf<T>[];
  removed: PropertyOf<T>[];
}

export type FMPropertyType =
  | "string"
  | "number"
  | "object"
  | "array"
  | "boolean";