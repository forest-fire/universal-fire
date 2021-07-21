/* eslint-disable @typescript-eslint/no-unsafe-return */
import { FireModel, Record } from "@/core";
import { IDatabaseSdk, ISerializedQuery, ISdk } from "@forest-fire/types";
import { IAuditLogItem, IModelOptions } from "@/types";

import { pathJoin } from "native-dash";

export class AuditBase {
  protected _modelKlass: new () => IAuditLogItem;
  protected _record: Record<ISdk, IAuditLogItem>;
  protected _db: IDatabaseSdk<ISdk>;
  protected _query: ISerializedQuery<ISdk, IAuditLogItem>;
  // index searchs (future)
  protected _recordId: string;
  protected _property: string;

  protected get db(): IDatabaseSdk<ISdk> {
    return this._db;
  }

  protected get dbPath(): string {
    return pathJoin(FireModel.auditLogs, this._record.pluralName);
  }

  constructor(modelKlass: new () => IAuditLogItem, options: IModelOptions = {}) {
    this._modelKlass = modelKlass;
    this._record = Record.create(modelKlass);
    this._db = options.db || FireModel.defaultDb;
  }
}
