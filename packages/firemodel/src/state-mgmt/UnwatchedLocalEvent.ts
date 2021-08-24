import { ISdk } from "@forest-fire/types";
import { IFmLocalEvent, IFmRecordMeta, IUnwatchedLocalEvent } from "~/types";
import { Model } from "~/models/Model";
import { Record } from "~/core";

export function UnwatchedLocalEvent<S extends ISdk, T extends Model>(
  rec: Record<T, S>,
  event: IFmLocalEvent<T>
): IUnwatchedLocalEvent<T> {
  const meta: IFmRecordMeta<T> = {
    dynamicPathProperties: rec.dynamicPathComponents,
    compositeKey: rec.compositeKey,
    modelConstructor: rec.modelConstructor,
    modelName: rec.modelName,
    pluralName: rec.pluralName,
    localModelName: rec.META.localModelName,
    localPath: rec.localPath,
    localPostfix: rec.META.localPostfix,
  };

  return { ...event, ...meta, dbPath: rec.dbPath, watcherSource: "unknown" };
}


