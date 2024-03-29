import { FireModel, Record } from "~/core";
import { IModelOptions, PrimaryKey } from "~/types";

import { FireModelError } from "~/errors";
import { ISdk } from "@forest-fire/types";
import { SerializedQuery } from "@forest-fire/serialized-query";
import { WatchBase } from "./WatchBase";
import { Model } from "~/models/Model";
export class WatchRecord<
  S extends ISdk = "RealTimeClient",
  T extends Model = Model
> extends WatchBase<S, T> {
  public static record<T extends Model>(
    modelConstructor: new () => T,
    pk: PrimaryKey<T>,
    options: IModelOptions = {}
  ): WatchRecord<ISdk, T> {
    if (!pk) {
      throw new FireModelError(
        `Attempt made to watch a RECORD but no primary key was provided!`,
        "firemodel/no-pk"
      );
    }
    const o = new WatchRecord<ISdk, T>();
    // if options hash has a DB reference; use it
    if (o.db) {
      o._db = options.db;
    }

    o._eventType = "value";
    o._watcherSource = "record";

    const r = Record.createWith<T, ISdk>(
      modelConstructor,
      pk,
      options.db ? { db: options.db } : {}
    );
    o._query = SerializedQuery.create<ISdk, T>(
      options.db || FireModel.defaultDb,
      `${r.dbPath}`
    );
    o._modelConstructor = modelConstructor;
    o._modelName = r.modelName;
    o._localModelName = r.META.localModelName;
    o._pluralName = r.pluralName;
    o._localPath = r.localPath;
    o._localPostfix = r.META.localPostfix;
    o._dynamicProperties = r.dynamicPathComponents;
    o._compositeKey = r.compositeKey;

    return o;
  }
}
