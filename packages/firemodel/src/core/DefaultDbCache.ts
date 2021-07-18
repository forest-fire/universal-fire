import { IDatabaseSdk, ISdk } from "universal-fire";

export type IDefaultDbCache<D extends IDatabaseSdk<any> | undefined> = {
  set<T extends IDatabaseSdk<any>>(db: T): IDefaultDbCache<T>;
  get: D extends IDatabaseSdk<any> ? () => D : never;
  sdk: D extends IDatabaseSdk<any> ? D["sdk"] : never;
}

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
    set<T extends IDatabaseSdk<any>>(db: T) {
      return DefaultDbCache(db);
    },
    get() {
      return db;
    },
    sdk: db ? db.sdk as D["sdk"] : undefined
  } as IDefaultDbCache<D>
}