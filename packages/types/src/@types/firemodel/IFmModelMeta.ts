import { IFmModelRelationshipMeta, IFmModelPropertyMeta, IModelIndexMeta } from "./index";
import { IModel } from "./models";

/**
 * **IFmModelMeta**
 *
 * The meta properties that describe the **Model** definition
 */
export interface IFmModelMeta<T extends IModel> {
  /** Optionally specify a root path to store this schema under */
  dbOffset?: string;
  /** Optionally specify an explicit string for the plural name */
  plural?: string;
  /**
   * **localPrefix**
   *
   * Optionally specify a _path_ which will be _prefixed_
   * to the path in the local store. The `localPath` variable will end up
   * being combined with the `localModelName` (for a **Record** watcher) or the
   * `pluralName` (for a **List** watcher)
   */
  localPrefix?: string;
  /**
   * **localPostfix**
   *
   * For local state management, the `localPostFix` provides a
   * way to add a directory after the `localPath` for **List** watchers
   * (note: `localPostFix` is ignored in **Record** watchers). If this
   * property is _not_ set then it will default to "all".
   *
   * In most cases the default property should suffice.
   */
  localPostfix?: string;
  /**
   * **localModelName**
   *
   * When defining a model that will be used with a frontend state management
   * framework like redux, vuex, etc. the **Record** watcher will use this
   * property to build the `localPath` variable:
   *
  ```js
  localPath = pathJoin(localPrefix, localModelName);
  ```
   *
   * It's default value will be the same as `modelName` but by exposing this
   * to the `@model` decorator it allows an override where that is
   * appropriate
   */
  localModelName?: string;
  /** provides a boolean flag on whether the stated name is a property */
  isProperty?: (prop: keyof T & string) => boolean;
  /** a function to lookup the meta properties of a given property */
  property?: (prop: keyof T & string) => IFmModelPropertyMeta<T>;
  /** provides a boolean flag on whether the stated name is a property */
  isRelationship?: (prop: keyof T & string) => boolean;
  /** a function to lookup the meta properties of a given relationship */
  relationship?: (prop: keyof T & string) => IFmModelRelationshipMeta<T>;
  audit?: boolean | "server";
  /** A list of all properties and associated meta-data for the given schema */
  properties?: Array<IFmModelPropertyMeta<T>>;
  /** A list of all relationships and associated meta-data for the given schema */
  relationships?: Array<IFmModelRelationshipMeta<T>>;
  /** A list of properties which should be pushed using firebase push() */
  pushKeys?: string[];
  /** indicates whether this property has been changed on client but not yet accepted by server */
  isDirty?: boolean;
  /** get a list the list of database indexes on the given model */
  dbIndexes?: IModelIndexMeta[];
  /** all the properties on this model; this includes props and relationships */
  allProperties?: string[];
}
