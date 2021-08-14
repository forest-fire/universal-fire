import { Model } from "~/models/Model";
import { ForeignKey, isCompositeKey, isCompositeString, PrimaryKey } from "~/types";

/**
 * Returns the `id` property of a record regardless of how it's represented
 */
export function getIdFromKey<T extends Model>(input: PrimaryKey<T> | ForeignKey<T>): string {
  if (isCompositeString(input)) {
    return input.replace(/::.*/, "");
  } else if (isCompositeKey(input)) {
    return input.id;
  } else {
    return input;
  }
}