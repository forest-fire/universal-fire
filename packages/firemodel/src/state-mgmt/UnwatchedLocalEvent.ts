import { ISdk } from "@forest-fire/types";
import {
  IFmLocalEvent,
  IFmRecordMeta,
  IWatcherUnwatchedContext,
} from "~/types";
import { Model } from "~/models/Model";
import { Record } from "~/core";

export function UnwatchedLocalEvent<S extends ISdk, T extends Model>(
  rec: Record<S, T>,
  event: IFmLocalEvent<T>
): IWatcherUnwatchedContext<T> {
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


