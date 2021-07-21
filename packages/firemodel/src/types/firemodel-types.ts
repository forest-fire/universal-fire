export interface IFmChangedProperties<T> {
  added: Array<keyof T & string>;
  changed: Array<keyof T & string>;
  removed: Array<keyof T & string>;
}

export type FMPropertyType =
  | "string"
  | "number"
  | "object"
  | "array"
  | "boolean";