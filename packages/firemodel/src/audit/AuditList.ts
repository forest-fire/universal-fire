import { IAuditLogItem, IModelOptions } from "@/types";
import { AuditBase } from "@/audit";
import { SerializedQuery } from "@forest-fire/serialized-query";
import { epochWithMilliseconds } from "common-types";
import { pathJoin } from "native-dash";

export class AuditList extends AuditBase {
  constructor(modelKlass: new () => IAuditLogItem, options: IModelOptions = {}) {
    super(modelKlass, options);
    this._query = SerializedQuery.create(this.db, pathJoin(this.dbPath, "all"));
  }

  public async first(
    howMany: number,
    offset = 0
  ): Promise<IAuditLogItem[]> {
    this._query = this._query.limitToFirst(howMany).startAt(offset);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }

  public async last(
    howMany: number,
    offset = 0
  ): Promise<IAuditLogItem[]> {
    this._query = this._query.limitToLast(howMany).startAt(offset);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }

  public async since(
    when: epochWithMilliseconds | string
  ): Promise<IAuditLogItem[]> {
    this._query = this._query.orderByChild("createdAt").startAt(when);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }

  public async before(
    when: epochWithMilliseconds | string
  ): Promise<IAuditLogItem[]> {
    this._query = this._query.orderByChild("createdAt").endAt(when);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }

  public async between(
    from: epochWithMilliseconds | string,
    to: epochWithMilliseconds | string
  ): Promise<IAuditLogItem[]> {
    this._query = this._query.orderByChild("createdAt").startAt(from).endAt(to);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }
}
