import { Model } from "~/models/Model";
import { IFmModelRelationshipMeta, IFmModelPropertyMeta, IModelIndexMeta, IModel } from "./index";
import { PropertyOf } from "./models";

/**
 * **IFmModelMeta**
 *
 * The meta properties that describe the **Model** definition and are
 * passed in as part of the `@model()` decorator call in the model 
 * definition
 */
export interface IFmModelMeta<TModel extends Model = Model> {
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
  isProperty?: (prop: PropertyOf<TModel>) => boolean;
  /** a function to lookup the meta properties of a given property */
  property?: (prop: PropertyOf<TModel>) => IFmModelPropertyMeta<TModel>;
  /** provides a boolean flag on whether the stated name is a property */
  isRelationship?: (prop: string) => boolean;
  /** 
   * A function to lookup the meta properties of a given relationship.
   * 
   * Note: _typing has been loosened to any string value as we are often dealing with
   * generic FK relationships and this typing allows easier coding but be aware that
   * the **prop** must be a valid key of the given model._
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relationship?: (prop: string) => IFmModelRelationshipMeta<TModel, any>;
  audit?: boolean | "server";
  /** A list of all properties and associated meta-data for the given schema */
  properties?: IFmModelPropertyMeta<TModel>[];
  /** A list of all relationships and associated meta-data for the given schema */
  relationships?: IFmModelRelationshipMeta<TModel>[];
  /** A list of properties which should be pushed using firebase push() */
  pushKeys?: string[];
  /** indicates whether this property has been changed on client but not yet accepted by server */
  isDirty?: boolean;
  /** get a list the list of database indexes on the given model */
  dbIndexes: IModelIndexMeta[];
  /** all the properties on this model; this includes props and relationships */
  allProperties: PropertyOf<TModel>[];
}
