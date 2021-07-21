import { IModel } from "~/types";

export type IModelConstructor<
  T extends IModel
  > = new () => T;

/**
 * a _function_ which when executed returns the constructor
 * to a `Model` subclass
 */
export type IFnToModelConstructor<
  T extends IModel
  > = () => IModelConstructor<T>;
