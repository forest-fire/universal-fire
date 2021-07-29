/* eslint-disable @typescript-eslint/ban-types */
import { epochWithMilliseconds } from "common-types";
import { IFmModelMeta } from "~/types";
import { Model } from "~/models";
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

/**
 * An interface which removes the a model's `META` property to reveal
 * just the data properties of the Model.
 */
export type IModel<T extends Model = Model> = Omit<T, "META"> 

/** A property of a given Model `T` */
export type PropertyOf<T extends Model> = keyof IModel<T> & string;

/**
 * Utility that converts an `IModel` type to the META key/value pair
 */
export type ModelMeta<T extends Model> = IFmModelMeta<T>;

/**
 * **ModelInput**
 *
 * Typescript utility to reduce a given model `IModel<T>` to only the non-managed properties.
 * This means `id`, `lastUpdated`, and `META` are no longer allowed parameters.
 */
export type ModelInput<T extends Model> = Omit<T, ModelManagedProps | "META">;

/**
 * **IDbModel**
 *
 * The same as `IModel` except that it assumes that the model's data has come from
 * the database and therefore the `id`, `lastUpdated` and `createdAt` fields are _not_
 * optional.
 */
export type IDbModel<T extends Model> = T & Required<IModelManaged>;
