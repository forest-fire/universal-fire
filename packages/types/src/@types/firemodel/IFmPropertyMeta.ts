/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFmModelAttributeBase } from "./index";
import { IModel } from "./models";

export interface IFmModelPropertyMeta<T extends IModel = IModel, P extends any[] = []>
  extends IFmModelAttributeBase<T, P> {
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
