/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FMPropertyType, FmRelationshipType, IModel } from "./index";
import { FmMockType, IFmFunctionToConstructor } from "./other";

/**
 * The attributes assigned to all properties on a Model
 */
export interface IFmModelAttributeBase<T extends IModel> {
  /** the property name */
  property: Extract<keyof T, string>;
  /** the property's "typed value" */
  type: FMPropertyType;
  /** constraint: a maximum length */
  length?: number;
  /** constraint: a minimum value */
  min?: number;
  /** constraint: a maximum value */
  max?: number;
  /** is this prop a FK relationship to another entity/entities */
  isRelationship?: boolean;
  /** is this prop an attribute of the schema (versus being a relationship) */
  isProperty?: boolean;
  /** is this property an array which is added to using firebase pushkeys? */
  pushKey?: boolean;
  /**
   * a name or function of a type of data which can be mocked
   * in a more complete way than just it's stict "type". Examples
   * would include "telephone", "name", etc.
   */
  mockType?: FmMockType<T>;
  /** a named mock can optionally recieve a set of parameters as additional input */
  mockParameters?: any[];
  /** what kind of relationship does this foreign key contain */
  relType?: FmRelationshipType;
  /** if the property is a relationship ... a constructor for the FK's Model */
  fkConstructor?: IFmFunctionToConstructor;
  fkModelName?: string;
}