import { IAuditChange } from "~/types";
import { IDictionary } from "common-types";
import { isModelClass } from "~/types";
import { Model } from "~/models/Model";

export function normalized(...args: string[]) {
  return args
    .filter((a) => a)
    .map((a) => a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, ""))
    .map((a) => a.replace(/\./g, "/"));
}

export function slashNotation(...args: string[]) {
  return normalized(...args).join("/");
}

export function firstKey<T extends IDictionary = IDictionary>(thingy: T) {
  return Object.keys(thingy)[0];
}

export function dotNotation(...args: string[]) {
  return normalized(...args)
    .join(".")
    .replace("/", ".");
}

export function updateToAuditChanges<T = any>(
  changed: IDictionary,
  prior: IDictionary
): IAuditChange[] {
  return Object.keys(changed).reduce<IAuditChange[]>(
    (prev: IAuditChange[], curr: Extract<keyof T, string>) => {
      const after = changed[curr];
      const before = prior[curr];
      const propertyAction = !before ? "added" : !after ? "removed" : "updated";
      const payload: IAuditChange = {
        before,
        after,
        property: curr,
        action: propertyAction,
      };
      prev.push(payload);
      return prev;
    },
    []
  );
}

export function withoutMetaOrPrivate<T extends Model>(model: T): T {
  if (isModelClass(model)) {
    delete model.META;
  }
  if (model) {
    Object.keys((key: keyof T & string) => {
      if (key.slice(0, 1) === "_") {
        delete model[key];
      }
    });
  }
  return model;
}

export function capitalize(str: string): string {
  return str ? str.slice(0, 1).toUpperCase() + str.slice(1) : "";
}

export function lowercase(str: string): string {
  return str ? str.slice(0, 1).toLowerCase() + str.slice(1) : "";
}

export function stripLeadingSlash(str: string): string {
  return str.slice(0, 1) === "/" ? str.slice(1) : str;
}
