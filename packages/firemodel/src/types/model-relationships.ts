import { Model } from "~/models/Model";

export type IModelConstructor<
  T extends Model
  > = new () => T;

/**
 * a _function_ which when executed returns the constructor
 * to a `Model` subclass
 */
export type IFnToModelConstructor<
  T extends Model
  > = () => IModelConstructor<T>;
