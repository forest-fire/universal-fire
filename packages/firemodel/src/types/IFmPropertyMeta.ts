/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFmModelAttributeBase, IModel } from "./index";

export interface IFmModelPropertyMeta<TModel extends IModel, TFk extends IModel = IModel>
  extends IFmModelAttributeBase<TModel, TFk> {
  /** constraint: a maximum length */
  length?: number;
  /** the minimum length of the property */
  min?: number;
  /** the maximum length of the property */
  max?: number;
  /** is this prop a FK relationship to another entity/entities */
  isRelationship?: boolean;
  /** is this prop an attribute of the schema (versus being a relationship) */
  isProperty?: boolean;
  /** is this property an array which is added to using firebase pushkeys? */
  pushKey?: boolean;
  /** hints that the given property is sensitive and should be encrypted for privacy concerns */
  encrypt?: boolean;
  /** a default value for the property if it is not already set */
  defaultValue?: any;
}
