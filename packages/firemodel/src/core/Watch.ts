import {
  FmEvents,
  IFmWatcherStopped,
  IModelOptions,
  PrimaryKey,
  IReduxDispatch,
  IWatcherEventContext,
} from "~/types";
import { IDatabaseSdk, IRtdbDbEvent, ISdk } from "@forest-fire/types";
import {
  WatchList,
  WatchRecord,
  clearWatcherPool,
  getWatcherPool,
  getWatcherPoolList,
  removeFromWatcherPool,
} from "./watchers";

import { DefaultDbCache, FireModel } from "~/core";
import { FireModelError } from "~/errors";
import { firstKey } from "~/util";
import { Model } from "~/models/Model";
import { IDictionary } from "common-types";

/**
 * A static library for interacting with _watchers_. It
 * provides the entry point into the watcher API and then
 * hands off to either `WatchList` or `WatchRecord`.
 */
export class Watch {
  /**
   * Sets the default database for all Firemodel
   * classes such as `FireModel`, `Record`, and `List`
   */
  public static set defaultDb(db: IDatabaseSdk<ISdk>) {
    DefaultDbCache().set<IDatabaseSdk<typeof db.sdk>>(db);
  }

  public static get defaultDb(): IDatabaseSdk<ISdk> {
    return DefaultDbCache().get();
  }

  /**
   * Sets the default dispatch for all Firemodel
   * classes such as `FireModel`, `Record`, and `List`
   */
  public static set dispatch(d: IReduxDispatch) {
    FireModel.dispatch = d;
  }

  /**
   * returns a full list of all watchers
   */
  public static get inventory(): IDictionary<IWatcherEventContext<ISdk>> {
    return getWatcherPool();
  }

  public static toJSON(): IDictionary<IWatcherEventContext<ISdk>> {
    return Watch.inventory;
  }

  /**
   * lookup
   *
   * Allows the lookup of details regarding the actively watched
   * objects in the Firebase database
   *
   * @param hashCode the unique hashcode given for each watcher
   */
  public static lookup<S extends ISdk = ISdk, T extends Model = Model>(hashCode: string): IWatcherEventContext<S, T> {
    const pool = getWatcherPool<S, T>();
    const ctx = pool[hashCode];
    if (!ctx) {
      throw new FireModelError(`You looked up an invalid watcher hashcode [${hashCode}].`, "firemodel/invalid-code");
    }

    return ctx;
  }

  public static get watchCount(): number {
    return Object.keys(getWatcherPool()).length;
  }

  public static reset(): void {
    clearWatcherPool();
  }

  /**
   * Finds the watcher by a given name and returns the ID of the
   * first match
   */
  public static findByName(name: string): string {
    const pool = getWatcherPool();
    return Object.keys(pool).find((i) => pool[i].watcherName === name);
  }

  /**
   * stops watching either a specific watcher or ALL if no hash code is provided
   */
  public static async stop(hashCode?: string, oneOffDB?: IDatabaseSdk<ISdk>): Promise<void> {
    const codes = new Set(Object.keys(getWatcherPool()));
    const db = oneOffDB || FireModel.defaultDb;
    if (!db) {
      throw new FireModelError(
        `There is no established way to connect to the database; either set the default DB or pass the DB in as the second parameter to Watch.stop()!`,
        `firemodel/no-database`
      );
    }
    if (hashCode && !codes.has(hashCode)) {
      const e = new FireModelError(
        `The hashcode passed into the stop() method [ ${hashCode} ] is not actively being watched!`
      );
      e.name = "firemodel/missing-hashcode";
      throw e;
    }

    if (!hashCode) {
      const pool = getWatcherPool();
      if (Object.keys(pool).length > 0) {
        const keysAndPaths = Object.keys(pool).reduce(
          (agg, key) => ({ ...agg, [key]: pool[key].watcherPaths }),
          {}
        );
        const dispatch = pool[firstKey(pool)].dispatch;
        db.unWatch();
        clearWatcherPool();
        await dispatch({
          type: FmEvents.WATCHER_STOPPED_ALL,
          stopped: keysAndPaths,
        });
      }
    } else {
      const registry = getWatcherPool()[hashCode];
      const events: IRtdbDbEvent | IRtdbDbEvent[] =
        registry.eventFamily === "child"
          ? "value"
          : ["child_added", "child_changed", "child_moved", "child_removed"];
      db.unWatch(events, registry.dispatch);
      // tslint:disable-next-line: no-object-literal-type-assertion
      await registry.dispatch({
        type: FmEvents.WATCHER_STOPPED,
        watcherId: hashCode,
        remaining: getWatcherPoolList().map((i) => ({
          id: i.watcherId,
          name: i.watcherName,
        })),
      } as IFmWatcherStopped);
      removeFromWatcherPool(hashCode);
    }
  }

  /**
   * Configures the watcher to be a `value` watcher on Firebase
   * which is only concerned with changes to a singular Record.
   *
   * @param pk the _primary key_ for a given record. This can be a string
   * represention of the `id` property, a string represention of
   * the composite key, or an object representation of the composite
   * key.
   */
  public static record<S extends ISdk, T extends Model>(
    modelConstructor: new () => T,
    pk: PrimaryKey<T>,
    options: IModelOptions = {}
  ): WatchRecord<S, T> {
    return WatchRecord.record(modelConstructor, pk, options) as WatchRecord<S, T>;
  }

  public static list<S extends ISdk, T extends Model>(
    /**
     * The **Model** subType which this list watcher will watch
     */
    modelConstructor: new () => T,
    /**
     * optionally state the _dynamic path_ properties which offset the **dbPath**
     */
    offsets?: Partial<T>
  ): WatchList<S, T> {
    return WatchList.list<S, T>(modelConstructor, { offsets });
  }
}
