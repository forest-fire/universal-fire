import type { IDictionary } from "common-types";

import { RealQueryOrderType } from "./index";
import { BaseSerializer } from "./index";
import type {
  IComparisonOperator,
  IRealQueryOrderType,
  IRealTimeQuery,
  ISimplifiedDatabase,
} from "./index";
import { IRtdbDataSnapshot } from "@forest-fire/types";

/**
 * Provides a way to serialize the full characteristics of a Firebase Realtime
 * Database query.
 */
export class SerializedRealTimeQuery<T = IDictionary> extends BaseSerializer<T> {
  public static path<T = IDictionary>(path: string = "/") {
    return new SerializedRealTimeQuery<T>(path);
  }

  protected _orderBy: IRealQueryOrderType = "orderByKey";

  public startAt(value: any, key?: keyof T & string) {
    this.validateKey("startAt", key, [
      RealQueryOrderType.orderByChild,
      RealQueryOrderType.orderByValue,
    ]);
    super.startAt(value, key);
    return this;
  }

  public endAt(value: any, key?: keyof T & string) {
    this.validateKey("endAt", key, [
      RealQueryOrderType.orderByChild,
      RealQueryOrderType.orderByValue,
    ]);
    super.endAt(value, key);
    return this;
  }

  public equalTo(value: any, key?: keyof T & string) {
    super.equalTo(value, key);
    this.validateKey("equalTo", key, [
      RealQueryOrderType.orderByChild,
      RealQueryOrderType.orderByValue,
    ]);
    return this;
  }

  public deserialize(db?: ISimplifiedDatabase): IRealTimeQuery {
    const database = db || this.db;
    let q: IRealTimeQuery = database.ref(this.path);

    switch (this._orderBy) {
      case "orderByKey":
        q = q.orderByKey();
        break;
      case "orderByValue":
        q = q.orderByValue();
        break;
      case "orderByChild":
        q = q.orderByChild(this.identity.orderByKey as string);
        break;
    }
    if (this.identity.limitToFirst) {
      q = q.limitToFirst(this.identity.limitToFirst);
    }
    if (this.identity.limitToLast) {
      q = q.limitToLast(this.identity.limitToLast);
    }
    if (this.identity.startAt) {
      q = q.startAt(this.identity.startAt, this.identity.startAtKey);
    }
    if (this.identity.endAt) {
      q = q.endAt(this.identity.endAt, this.identity.endAtKey);
    }
    if (this.identity.equalTo) {
      q = this.identity.equalToKey
        ? q.equalTo(this.identity.equalTo, this.identity.equalToKey)
        : q.equalTo(this.identity.equalTo);
    }
    return q;
  }

  public async execute(db?: ISimplifiedDatabase): Promise<IRtdbDataSnapshot> {
    const database = db || this.db;
    const snapshot = await this.deserialize(database).once("value");
    return snapshot;
  }

  public where<V>(operation: IComparisonOperator, value: V, key?: keyof T & string) {
    switch (operation) {
      case "=":
        return this.equalTo(value, key);
      case ">":
        return this.startAt(value, key);
      case "<":
        return this.endAt(value, key);
      default:
        const err: any = new Error(`Unknown comparison operator: ${operation}`);
        err.code = "invalid-operator";
        throw err;
    }
  }

  /**
   * Ensures that when a `key` is passed in as part of the query modifiers --
   * such as "startAt", "endAt", etc. -- that the sorting strategy is valid.
   *
   * @param caller gives a simple string name for the method
   * which is currently being called to modify the search filters
   * @param key the key value that _might_ have been erroneously passed in
   */
  protected validateKey(caller: string, key: keyof T | undefined, allowed: IRealQueryOrderType[]) {
    const isNotAllowed = allowed.includes(this._orderBy) === false;
    if (key && isNotAllowed) {
      throw new Error(
        `You can not use the "key" parameter with ${caller}() when using a "${
        this._orderBy
        }" sort. Valid ordering strategies are: ${allowed.join(", ")}`
      );
    }
  }
}
