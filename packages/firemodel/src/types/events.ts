import type { ISdk } from "@forest-fire/types";

import {
  FmEvents,
  ICompositeKey,
  IFmLocalEvent,
  IFmLocalRecordEvent,
  IFmLocalRelationshipEvent,
  IFmServerOrLocalEvent,
  IWatcherEventContext,
} from "~/types";
import { Model } from "~/models/Model";

export interface IFmWatcherStopped {
  type: typeof FmEvents.WATCHER_STOPPED;
  watcherId: string;
  remaining: [
    {
      id: string;
      name: string;
    }
  ];
}

export type IUnwatchedLocalEvent<T extends Model = Model> = IFmLocalEvent<T> &
  IEventTimeContext &
  IFmRecordMeta<T> & {
    watcherSource: "unknown";
  };

/**
 * **IFmWatchEvent**
 *
 * This represents the payload which **Firemodel** will dispatch when
 * _watcher context_ is available.
 */
export type IFmWatchEvent<
  S extends ISdk = ISdk,
  T extends Model = Model
> = IFmServerOrLocalEvent<T> & IEventTimeContext & IWatcherEventContext<S, T>;

/**
 * **IFmWatchEventLocalRecord**
 *
 * If you have _locally_ originated event for a `Record` based event then this is
 * the payload you will get.
 */
export type IFmWatchEventLocalRecord<
  S extends ISdk,
  T extends Model = Model
> = IFmLocalRecordEvent<T> & IEventTimeContext & IWatcherEventContext<S, T>;

/**
 * **IFmWatchEventLocalRelationship**
 *
 * If you have _locally_ originated event for a _relationship_ based event then this is
 * the payload you will get. Note, however, it is not that uncommon that relationships are
 * managed locally _without_ having a watcher on the primary model. In this case you should
 * instead use `IFmUnwatchedLocalRelationship` instead.
 *
 * NOTE: because relationships are a _local-only_ phenomenon, even a non-watched event
 * has a LOT of meta information and therefore you can often just pair down to the
 * `IFmLocalRelationshipEvent` and not worry about whether the event was watched or not.
 */
export type IFmWatchEventLocalRelationship<
  S extends ISdk,
  T extends Model = Model
> = IFmLocalRelationshipEvent<T> &
  IEventTimeContext &
  IWatcherEventContext<S, T>;

export type IFmWatchEventLocal<S extends ISdk, T extends Model> =
  | IFmWatchEventLocalRecord<S, T>
  | IFmWatchEventLocalRelationship<S, T>;

export interface IFmRecordMeta<T extends Model> {
  /**
   * The properties on the underlying _model_ which are needed
   * to compose the `CompositeKey` (excluding the `id` property)
   */
  dynamicPathProperties: string[];
  /**
   * If the underlying _model_ has a dynamic path then this key
   * will be an object containing `id` as well as all dynamic
   * path properties.
   *
   * If the _model_ does **not** have a dynamic path then this
   * will just be a string value for the key (same as `id`)
   */
  compositeKey: ICompositeKey<T>;
  /**
   * A constructor to build a model of the underlying model type
   */
  modelConstructor: new () => T;
  /** the _singular_ name of the Model */
  modelName: string;
  /** the _plural_ name of the Model */
  pluralName: string;
  /** the _local_ name of the Model */
  localModelName: string;
  /**
   * the _local path_ in the frontend's state management
   * state tree to store this watcher's results.
   */
  localPath: string;
  /**
   * The _postfix_ string which resides off the root of the
   * local state management's state module. By default this
   * is `all` but can be modified on a per-model basis.
   */
  localPostfix: string;
}

/**
 * The extra meta-data that comes from combining
 * the _watcher context_ and the _event_
 */
export interface IEventTimeContext {
  type: FmEvents;
  dbPath: string;
}
