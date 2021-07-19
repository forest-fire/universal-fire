import { getProperties } from "./index";

export function getPushKeys<T extends {}>(target: T) {
  const props = getProperties(target);
  return props.filter((p) => p.pushKey).map((p) => p.property);
}
