/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IAuditLogItem, IModelOptions } from "@/types";
import { AuditBase } from "@/audit";
import { SerializedQuery } from "@forest-fire/serialized-query";
import { epochWithMilliseconds } from "common-types";
import { pathJoin } from "native-dash";

export class AuditRecord extends AuditBase {
  constructor(
    modelKlass: new () => IAuditLogItem,
    id: string,
    options: IModelOptions = {}
  ) {
    super(modelKlass, options);
    this._recordId = id;
    this._query = SerializedQuery.create(this.db);
  }

  /**
   * Queries the database for the first _x_ audit records [`howMany`] of
   * a given Record type. You can also optionally specify an offset to
   * start at [`startAt`].
   */
  public async first(howMany: number, startAt?: string): Promise<IAuditLogItem[]> {
    this._query = this._query.setPath(this.byId);

    this._query = this._query.orderByKey().limitToLast(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }
    const ids = (await this.db.getList<IAuditLogItem>(this._query)).map((i) =>
      pathJoin(this.auditLogs, i.id)
    );
    const wait: Promise<IAuditLogItem>[] = []
    ids.map((id) => wait.push(this.db.getValue<IAuditLogItem>(id) as Promise<IAuditLogItem>));
    const results = await Promise.all(wait);
    return results;
  }

  public async last(howMany: number, startAt?: string) {
    this._query = this._query
      .setPath(this.byId)
      .orderByKey()
      .limitToFirst(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }
    const ids = (await this.db.getList<IAuditLogItem>(this._query)).map((i) =>
      pathJoin(this.auditLogs, i.id)
    );
    const wait: Promise<IAuditLogItem>[] = [];
    ids.map((id) => wait.push(this.db.getValue(id) as Promise<IAuditLogItem>));
    const results = await Promise.all(wait);
    return results;
  }

  public async since(when: epochWithMilliseconds | string) {
    if (typeof when === "string") {
      when = new Date(when).getTime();
    }

    this._query = this._query
      .setPath(this.byId)
      .orderByChild("value")
      .startAt(when);

    const ids = (await this.db.getList<IAuditLogItem>(this._query)).map((i) =>
      pathJoin(this.auditLogs, i.id)
    );

    const wait: Promise<IAuditLogItem>[] = [];

    ids.map((id) => {
      wait.push(this.db.getValue(id) as Promise<IAuditLogItem>);
    });
    const results = Promise.all(wait);
    return results;
  }

  public async before(when: epochWithMilliseconds | string) {
    if (typeof when === "string") {
      when = new Date(when).getTime();
    }

    this._query = this._query
      .setPath(this.byId)
      .orderByChild("value")
      .endAt(when);
    const qr = await this.db.getList<IAuditLogItem>(this._query);

    const ids = (await this.db.getList<IAuditLogItem>(this._query)).map((i) =>
      pathJoin(this.auditLogs, i.id)
    );

    const wait: Promise<IAuditLogItem>[] = [];

    ids.map((id) => {
      wait.push(this.db.getValue(id) as Promise<IAuditLogItem>);
    });
    const results = Promise.all(wait);
    return results;
  }

  public async between(
    after: epochWithMilliseconds | string,
    before: epochWithMilliseconds | string
  ) {
    if (typeof after === "string") {
      after = new Date(after).getTime();
    }
    if (typeof before === "string") {
      before = new Date(before).getTime();
    }

    this._query = this._query
      .setPath(this.byId)
      .orderByChild("value")
      .startAt(after)
      .endAt(before);

    const ids = (await this.db.getList<IAuditLogItem>(this._query)).map((i) =>
      pathJoin(this.auditLogs, i.id)
    );

    const wait: Promise<IAuditLogItem>[] = [];
    ids.map((id) => wait.push(this.db.getValue(id) as Promise<IAuditLogItem>));
    const results = Promise.all(wait);

    return results;
  }

  protected get auditLogs() {
    return pathJoin(this.dbPath, "all");
  }

  protected get byId() {
    return pathJoin(this.dbPath, "byId", this._recordId, "all");
  }

  protected byProp(prop: string) {
    return pathJoin(this.dbPath, "byId", this._recordId, "props", prop);
  }
}
