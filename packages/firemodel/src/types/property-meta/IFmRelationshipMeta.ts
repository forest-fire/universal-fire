/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFmModelAttributeBase } from "./index";
import { IFnToModelConstructor } from "../model-relationships";
import { Model } from "~/models/Model";
import { IFmRelationshipDirectionality } from "../other";

export enum FmRelationshipType {
  hasMany = "hasMany",
  hasOne = "hasOne"
}
export type IFmRelationshipType = "hasMany" | "hasOne";

export interface IFmModelRelationshipMeta<TModel extends Model = any, TFk extends Model = any>
  extends IFmModelAttributeBase<TModel, TFk> {
  isRelationship: true;
  isProperty: false;

  /** the general cardinality type of the relationship (aka, hasMany, hasOne) */
  relType: FmRelationshipType;
  /**
   * a boolean flag indicating whether the relationship is "two-way" and therefore
   * the FK's model definition would be expected to have a relationship pointing back
   * to the PK's record.
   */
  hasInverse: boolean;
  /** the property name on the related model that points back to this relationship */
  inverseProperty?: string;
  /** indicates whether the relationship is one-way or bi-directional */
  directionality: IFmRelationshipDirectionality;
  /** The constructor for a model of the FK reference that this relationship maintains */
  fkConstructor: IFnToModelConstructor<TFk>;
  /** the singular name of the relationship's model */
  fkModelName?: string;
  /** the plural name of the relationship's model */
  fkPluralName?: string;
}