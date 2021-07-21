import { IDictionary } from "common-types";
import { Record } from "~/core";
import { createCompositeKeyFromRecord } from "./index";
import { ISdk } from "@forest-fire/types";
import { Model } from "~/models/Model";
import { keys } from "native-dash";

/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export function createCompositeKeyRefFromRecord<S extends ISdk, T extends Model = Model>(
  rec: Record<S, T>
): string {
  const cKey: IDictionary & { id: string } = createCompositeKeyFromRecord(rec);
  return rec.hasDynamicPath ? createCompositeRef(cKey) : rec.id;
}

/**
 * Given a hash/dictionary (with an `id` prop), will generate a "composite
 * reference" in string form.
 */
export function createCompositeRef<T extends { id: string }>(cKey: T): string {
  const rest = Object.keys(cKey).length > 1
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    ? keys(cKey).filter((k) => k !== "id").map((k) => `::${k}:${cKey[k]}`).join("")
    : "";
  return `${cKey.id}${rest}`
}