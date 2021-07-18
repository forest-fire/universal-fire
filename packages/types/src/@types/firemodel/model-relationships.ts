import { IModel } from "./index";

export type IModelConstructor<
  T extends IModel = IModel
  > = new () => IModelSubclass<T>;

/**
 * a _function_ which when executed returns the constructor
 * to a `Model` subclass
 */
export type IFnToModelConstructor<
  T extends IModel = IModel
  > = () => IModelConstructor<T>;

export type IModelSubclass<T extends IModel> = T;