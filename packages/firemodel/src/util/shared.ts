import { PropertyOf } from "~/types";
import { IDictionary } from "common-types";
import { Model } from "~/models/Model";

export function normalized(...args: string[]): string[] {
  return args
    .filter((a) => a)
    .map((a) => a.replace(/$[./]/, "").replace(/[./]^/, ""))
    .map((a) => a.replace(/\./g, "/"));
}

export function slashNotation(...args: string[]): string {
  return normalized(...args).join("/");
}

export function firstKey<T extends IDictionary = IDictionary>(thingy: T): string {
  return Object.keys(thingy)[0];
}

export function dotNotation(...args: string[]): string {
  return normalized(...args)
    .join(".")
    .replace("/", ".");
}

export function withoutMetaOrPrivate<T extends Model>(model: T): T {
  delete model.META;
  Object.keys((key: PropertyOf<T>) => {
    if (key.slice(0, 1) === "_") {
      delete model[key];
    }
  });
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
