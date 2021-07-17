import { FireModel, Record } from "@/core";
import { IDatabaseSdk, ISerializedQuery } from "universal-fire";
import { IModel, IModelOptions } from "@/types";

import { pathJoin } from "@/util";

export class AuditBase<T extends IModel = IModel> {
  protected _modelKlass: new () => T;
  protected _record: Record<T>;
  protected _db: IDatabaseSdk;
  protected _query: ISerializedQuery;
  // index searchs (future)
  protected _recordId: string;
  protected _property: string;

  protected get db(): IDatabaseSdk {
    return this._db;
  }

  protected get dbPath() {
    return pathJoin(FireModel.auditLogs, this._record.pluralName);
  }

  constructor(modelKlass: new () => T, options: IModelOptions = {}) {
    this._modelKlass = modelKlass;
    this._record = Record.create(modelKlass);
    this._db = options.db || FireModel.defaultDb;
  }
}
