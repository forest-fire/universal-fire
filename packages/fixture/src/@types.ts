import { EventFrom, FakerStatic, ISdk, SnapshotFrom } from "@forest-fire/types";
import { IDictionary } from 'common-types';

import type {
  IRtdbDbEvent,
  IRtdbDataSnapshot,
} from '@forest-fire/types';

export interface ISchemaHelper<T extends unknown> {
  context: T;
  faker: FakerStatic;
}

export interface ISchema {
  id: string;
  /** path to the database which is the root for given schema list */
  path: () => string;
  /** mock generator function */
  fn: () => IDictionary;
  /**
   * the name of the entity being mocked, if not set then schema name
   * is assume to equal model name
   */
  modelName?: string;
  /** a static path that preceeds this schema's placement in the database */
  prefix?: string;
}

export interface IRelationship {
  id: string;
  /** cardinality type */
  type: 'hasMany' | 'belongsTo';
  /** the source model */
  source: string;
  /**
   * the property on the source model which is the FK
   * (by default it will use standard naming conventions)
   */
  sourceProperty: string;
  /** the model being referred to in the source model's FK */
  target: string;
}

/** Queued up schema's ready for generation */
export interface IQueue {
  id: string;
  schema: string;
  quantity: number;
  hasMany?: IDictionary<number>;
  overrides?: IDictionary;
  prefix: string;
  /** the key refers to the property name, the value true means "fulfill" */
  belongsTo?: IDictionary<boolean>;
}

/** A Schema's mock callback generator must conform to this type signature */
export type SchemaCallback<T extends unknown = unknown> = (helper: ISchemaHelper<T>) => () => T;



export type EventHandler =
  | HandleValueEvent
  | HandleNewEvent
  | HandleRemoveEvent;
export type GenericEventHandler = (
  snap: IRtdbDataSnapshot,
  key?: string
) => void;
export type HandleValueEvent = (dataSnapShot: IRtdbDataSnapshot) => void;
export type HandleNewEvent = (
  childSnapshot: IRtdbDataSnapshot,
  prevChildKey: string
) => void;
export type HandleRemoveEvent = (oldChildSnapshot: IRtdbDataSnapshot) => void;
export type HandleMoveEvent = (
  childSnapshot: IRtdbDataSnapshot,
  prevChildKey: string
) => void;
export type HandleChangeEvent = (
  childSnapshot: IRtdbDataSnapshot,
  prevChildKey: string
) => void;

export type QueryValue = number | string | boolean | null;
