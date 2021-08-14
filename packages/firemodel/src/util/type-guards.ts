export function isString(v: unknown): v is string {
  return typeof v === "string";
}

export function isArrayOf<T extends "string" | "number" | "object" | "boolean" | "any", O extends Record<string, unknown> = Record<string, unknown>>(of: T, v: unknown): v is (T extends "string" ? string[] : T extends "number" ? number[] : T extends "object" ? O : unknown[]) {
  switch (of) {
    case "any":
      return Array.isArray(v);
    case "boolean":
      return Array.isArray(v) && v.every(i => typeof (i) === "boolean");
    case "number":
      return Array.isArray(v) && v.every(i => typeof (i) === "number");
    case "string":
      return Array.isArray(v) && v.every(i => typeof (i) === "string");
    case "object":
      return Array.isArray(v) && v.every(i => typeof (i) === "object");
  }
}