import { FireModelError } from "@/errors";
import { IDatabaseSdk, ISdk } from "universal-fire";

export type IDefaultDbCache<D extends IDatabaseSdk<ISdk>> = {
  set<T extends IDatabaseSdk<ISdk>>(db: T): IDefaultDbCache<T>;
  get: D extends IDatabaseSdk<ISdk> ? () => D : never;
  sdk: D extends IDatabaseSdk<ISdk> ? D["sdk"] : never;
}

let cache: IDatabaseSdk<ISdk>;

/**
 * Provides a cache of the "default database" so that operations
 * which are not explicit about a DB can just use this default.
 * 
 * Outside of advanced use-cases where multiple databases
 * are used, consumers of Firemodel will usually just rely
 * on the default db.
 */
export function DefaultDbCache<D extends IDatabaseSdk<S>, S extends ISdk>(db?: D): IDefaultDbCache<D> {

  return {
    set<T extends IDatabaseSdk<ISdk>>(db: T) {
      cache = db;
      return DefaultDbCache(db);
    },
    get() {
      if (!cache) {
        throw new FireModelError(`Attempt to use default database as it was not set!`, "not-ready/no-default-db")
      }
      return cache as IDatabaseSdk<typeof cache["sdk"]>;
    },
    sdk: db ? db.sdk as D["sdk"] : undefined
  } as IDefaultDbCache<D>
}