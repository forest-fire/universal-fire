import { IDictionary } from "common-types";
import { Record } from "@/core";
import { createCompositeKey } from "./index";
import { ISdk, IModel } from "@forest-fire/types";

/**
 * Creates a string based composite key if the passed in record
 * has dynamic path segments; if not it will just return the "id"
 */
export function createCompositeKeyRefFromRecord<S extends ISdk, T extends IModel = IModel>(
  rec: Record<S, T>
) {
  const cKey: IDictionary & { id: string } = createCompositeKey(rec);
  return rec.hasDynamicPath ? createCompositeRef(cKey) : rec.id;
}

/**
 * Given a hash/dictionary (with an `id` prop), will generate a "composite
 * reference" in string form.
 */
export function createCompositeRef(cKey: IDictionary & { id: string }) {
  return Object.keys(cKey).length > 1
    ? cKey.id +
    Object.keys(cKey)
      .filter((k) => k !== "id")
      .map((k) => `::${k}:${cKey[k]}`)
    : cKey.id;
}
