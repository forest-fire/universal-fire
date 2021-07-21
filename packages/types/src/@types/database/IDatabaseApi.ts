/* eslint-disable @typescript-eslint/ban-types */

import { IAbstractedEvent } from '../fire-proxies';
import { ISdk } from '../fire-types';
import { IRtdbReference } from '../proxy-plus';
import { ISerializedQuery } from '../query';

/**
 * The commands which `universal-fire` exposes to interact with the database
 * regardless of the SDK client.
 *
 * > This also provides the core API which a DB _mock_ in **Firemock** will need
 * > to expose while intereacting with the DB's native language to provide the
 * > functionality
 */
export interface IDatabaseApi<
  TSdk extends ISdk
  > {
  /**
   * The SDK being used when interacting with the database
   */
  sdk: TSdk;
  /**
   * Get a database _reference_ to the underlying database at a given path
   */
  ref: (path?: string) => IRtdbReference;

  /**
   * Get a _list_ of records at a given path in the database. The return representation will be
   * an array of dictionaries where the _key_ for the record will be assigned the property value
   * of `id` (unless overriden by the `idProp` param)
   */
  getList: <T extends unknown = unknown, P extends string | ISerializedQuery<TSdk, T> = string | ISerializedQuery<TSdk, T>>(
    path: P,
    idProp?: string
  ) => Promise<T[]>;
  /**
   * Gets a push-key from the server at a given path. This ensures that
   * multiple client's who are writing to the database will use the server's
   * time rather than their own local time.
   *
   * @param path the path in the database where the push-key will be pushed to
   */
  getPushKey: (path: string) => Promise<string>;
  /**
   * Gets a record from a given path in the Firebase DB and converts it to an
   * object where the record's key is included as part of the record.
   */
  getRecord: <T extends {} = {}> (
    path: string,
    idProp?: string
  ) => Promise<T>;
  /**
   * Returns the value at a given path in the database. This method is a
   * typescript _generic_ which defaults to `unknown` but you can set the type to
   * whatever value you expect at that path in the database.
   */
  getValue: <T = unknown>(path: string) => Promise<T | void>;
  /**
   * Updates the database at a given path.
   *
   * Note:  this operation is **non-destructive**, so assuming that the value you
   * are passing in a POJO/object then the properties sent in will be updated but if
   * properties that exist in the DB, but not in the value passed in then these properties
   * will _not_ be changed.
   */
  update: <T = unknown>(path: string, value: Partial<T>) => Promise<void>;
  /**
   * Sets a value in the database at a given path.
   */
  set: <T = unknown>(path: string, value: T) => Promise<void>;
  /**
   * Removes a path from the database.
   */
  remove: (path: string, ignoreMissing?: boolean) => Promise<unknown>;
  /**
   * Watch for Firebase events based on a DB path.
   */
  watch: <T extends {} = {}>(
    target: string | ISerializedQuery<TSdk, T>,
    events: IAbstractedEvent | IAbstractedEvent[],
    cb: unknown
  ) => void;
  /**
   * Unwatches existing Firebase events.
   */
  unWatch: (
    events?: IAbstractedEvent | IAbstractedEvent[],
    cb?: unknown
  ) => void;
}
