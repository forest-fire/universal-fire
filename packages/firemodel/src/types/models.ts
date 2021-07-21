/* eslint-disable @typescript-eslint/ban-types */
import { IDictionary } from 'brilliant-errors';
import { epochWithMilliseconds } from 'common-types';
import { IFmModelMeta } from '~/types';
import { Model } from '~/models';
/**
 * Properties in a model which are managed and should not be set by a
 * user directly.
 */
export interface IModelManaged {
  id?: string;
  lastUpdated?: epochWithMilliseconds;
  createdAt?: epochWithMilliseconds;
}

/**
 * Properties managed by the system and not to be set manually
 */
export type ModelManagedProps = keyof IModelManaged;

export type IModelProps = Record<string, unknown> & IModelManaged;

/**
 * A base representation of any **Model**.
 * 
 * - the generic `<T>` allows extending the props beyond the managed props like `id`, `lastUpdated`, etc.
 * - the `META` property is masked in this interface and instead exposed in the `IModelClass` interface
 */
export type IModel<T extends Model = Model> = Omit<T, "META">;

/**
 * Utility that converts an `IModel` type to the META key/value pair
 */
export type ModelMeta<T extends Model> = IFmModelMeta<T>;

/**
 * The `IModel` interface _plus_ the META property
 */
export type IModelClass<T extends Model> = Omit<T, "META"> & { META: ModelMeta<T> };

/**
 * **ModelInput**
 * 
 * Typescript utility to reduce a given model `IModel<T>` to only the non-managed properties.
 * This means `id`, `lastUpdated`, and `META` are no longer allowed parameters.
 */
export type ModelInput<T extends Model> = Omit<T, ModelManagedProps>;

/**
 * **IDbModel**
 * 
 * The same as `IModel` except that it assumes that the model's data has come from
 * the database and therefore the `id`, `lastUpdated` and `createdAt` fields are _not_
 * optional.
 */
export type IDbModel<T extends Model> = T & Required<IModelManaged> & { META: ModelMeta<T> }


/**
 * A type guard that recieves an `IModel` and if the run time data has a META property (which it
 * should in most cases) then it will be recognized once passing this test as the interface
 * `IModelClass<T>` versus simply `IModel<T>`.
 */
export function isModelClass<T extends Model>(model: T): model is T & { META: ModelMeta<T> } {
  return (model as any).META !== undefined;
}

/**
 * A _type guard_ which receives an `IModel` and upgrades it to a `IDbModel` if the 
 * managed properties are set
 */
export function isDbModel<T extends {}>(model: IModelClass<T>): model is IDbModel<T> {
  return model.META && (model as IDictionary)?.id && (model as IDictionary)?.createdAt && (model as IDictionary)?.lastUpdated ? true : false;
}