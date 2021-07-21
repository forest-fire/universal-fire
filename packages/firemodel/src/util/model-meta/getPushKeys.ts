import { Model } from "~/models";
import { getProperties } from "./index";

export function getPushKeys<T extends Model>(target: T): Extract<keyof T, string>[] {
  const props = getProperties(target);
  return props.filter((p) => p.pushKey).map((p) => p.property);
}
