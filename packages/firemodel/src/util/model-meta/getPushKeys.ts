import type { Model } from "~/models/Model";

export function getPushKeys<T extends Model>(model: T): string[] {
  return model?.META?.pushKeys || [];
}
