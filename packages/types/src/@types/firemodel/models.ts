/* eslint-disable @typescript-eslint/ban-types */
import { epochWithMilliseconds } from 'common-types';
import { IFmModelMeta } from './index';

/**
 * Provides the structure -- without implementation -- of the base `Model` class
 * which Firemodel extends for all user defined models
 */
export type IModel<T extends {} = {}> = Partial<IModelInstance<T>>


export type IModelBase<T extends {}> = {
  id: string;
  lastUpdated: epochWithMilliseconds;
  createdAt: epochWithMilliseconds;
  META: Readonly<IFmModelMeta<T>>;
}

/**
 * A record of a particular model can
 * be represented as a `IModelInstance`.
 */
export type IModelInstance<
  T extends {}
  > = IModelBase<T> & T;

/**
 * A generic model which has typings for `IModel` but allows
 * other name/value pairs too.
 */
export type IGenericModel = Record<string, unknown> & IModel;
