/* eslint-disable @typescript-eslint/ban-types */
import { epochWithMilliseconds } from 'common-types';
import { IFmModelMeta } from './index';
/**
 * Properties in a model which are managed and should not be set by a
 * user directly.
 */
export type IModelManaged<T extends IModel> = {
  id?: string;
  lastUpdated?: epochWithMilliseconds;
  createdAt?: epochWithMilliseconds;
  META?: Readonly<IFmModelMeta<T>>;
};

/**
 * Properties managed by the system and not to be set manually
 */
export type ModelManagedProps = keyof IModelManaged<never>;



/**
 * A base representation of any **Model**.
 * 
 * - the generic `<T>` allows extending the props beyond the managed props like `id`, `lastUpdated`, etc.
 */
export type IModel<T extends {} = {}> = T & IModelManaged<T>;

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
export type IDbModel<T extends {}> = T & Required<IModelManaged<T>>

/**
 * A _type guard_ which receives an `IModel` and upgrades it to a `IDbModel` if the 
 * managed properties are set
 */
export function isDbModel<T extends {}>(model: IModel<T>): model is IDbModel<T> {
  return model.META && model.id && model.createdAt && model.lastUpdated ? true : false;
}