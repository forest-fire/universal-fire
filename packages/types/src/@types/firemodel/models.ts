/* eslint-disable @typescript-eslint/ban-types */
import { IDictionary } from 'brilliant-errors';
import { epochWithMilliseconds } from 'common-types';
import { IFmModelMeta } from './index';
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
export type IModel<T extends IModelProps = {}> = T & IModelManaged;
/**
 * Utility that converts an `IModel` type to the META key/value pair
 */
export type ModelMeta<T extends IModel> = IFmModelMeta<T>;


/**
 * The `IModel` interface _plus_ the META property
 */
export type IModelClass<T extends IModel> = Omit<T, "META"> & { META: ModelMeta<T> };

/**
 * **ModelInput**
 * 
 * Typescript utility to reduce a given model `IModel<T>` to only the non-managed properties.
 * This means `id`, `lastUpdated`, and `META` are no longer allowed parameters.
 */
export type ModelInput<T extends IModel> = Omit<T, ModelManagedProps>;

/**
 * **IDbModel**
 * 
 * The same as `IModel` except that it assumes that the model's data has come from
 * the database and therefore the `id`, `lastUpdated` and `createdAt` fields are _not_
 * optional.
 */
export type IDbModel<T extends IModel> = T & Required<IModelManaged> & { META: ModelMeta<T> }

/**
 * A _type guard_ which receives an `IModel` and upgrades it to a `IDbModel` if the 
 * managed properties are set
 */
export function isDbModel<T extends {}>(model: IModelClass<T>): model is IDbModel<T> {
  return model.META && (model as IDictionary)?.id && (model as IDictionary)?.createdAt && (model as IDictionary)?.lastUpdated ? true : false;
}