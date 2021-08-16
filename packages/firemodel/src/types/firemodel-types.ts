import { Model } from "~/models/Model";
import { PropertyOf } from "./models";

export interface IFmChangedProperties<T extends Model> {
  added: PropertyOf<T>[];
  changed: PropertyOf<T>[];
  removed: PropertyOf<T>[];
}


export enum FmPropertyType {
  string = "string",
  number = "number",
  object = "object",
  array = "array",
  symbol = "symbol",
  boolean = "boolean",
  unknown = "unknown"
}

/**
 * The _type_ of the variable extracted from the reflection API
 */
export type IFmPropertyType = keyof typeof FmPropertyType;