import { FireModelError } from "@/errors";
import { IModel, IModelClass, IModelProps, ModelMeta } from "@forest-fire/types";

/**
 * Takes an `IModel` data structure and converts it to
 * a `IModelClass` (which has META) on it. If META is 
 * not found then an error will be thrown.
 */
export function convertModelToModelClass<T extends IModel>(model: T): IModelClass<T> {
  const META = (model as unknown as IModelProps).META as undefined | ModelMeta<T>;
  if (!META) {
    throw new FireModelError(`Attempt to convert a model to the "IModelClass" interface failed as no META property was present. The model looks like:\n${JSON.stringify(model, null, 2)}`);
  }

  return { ...model, META } as unknown as IModelClass<T>
}