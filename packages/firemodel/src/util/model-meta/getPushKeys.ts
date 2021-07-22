import { Model } from "~/models";

export function getPushKeys<T extends Model>(model: T): string[] {
  return model.META.pushKeys;
}
