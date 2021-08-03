import { FmPropertyType } from "~/types";

export type ReflectionType = "Object" | "Symbol" | "Number" | "String" | "Boolean";

export function determineType(type: ReflectionType): FmPropertyType {
  switch (type) {
    case "Boolean":
      return FmPropertyType.boolean;
    case "Number":
      return FmPropertyType.number;
    case "Object":
      return FmPropertyType.object;
    case "String":
      return FmPropertyType.string;
    case "Symbol":
      return FmPropertyType.symbol;
    default:
      return FmPropertyType.unknown;
  }
}