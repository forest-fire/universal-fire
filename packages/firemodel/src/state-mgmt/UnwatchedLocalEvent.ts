import { ISdk } from "@forest-fire/types";
import { IFmLocalEvent, IFmRecordMeta, IModel } from "~/types";

import { Record } from "~/core";

export type IUnwatchedLocalEvent<T> = IFmRecordMeta<T> & { dbPath: string, watcherSource: string, type: "UnwatchedLocalEvent" }

export function UnwatchedLocalEvent<S extends ISdk, T extends IModel>(
  rec: Record<S, T>,
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

  return { ...event, ...meta, dbPath: rec.dbPath, watcherSource: "unknown", type: "UnwatchedLocalEvent" };
}
