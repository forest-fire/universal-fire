import { IRecord } from "@/types";
import { IDictionary } from "common-types";
import { keys } from "native-dash";
import { IFmModelMeta, IModel, ISdk } from "universal-fire";

const meta: IDictionary<IFmModelMeta<IModel>> = {};

export function addModelMeta(
  modelName: string,
  props: IFmModelMeta<IModel>
): void {
  meta[modelName] = props;
}


/**
 * Returns the META info for a given model, it will attempt to resolve
 * it locally first but if that is not available (as is the case with
 * self-reflexify relationships) then it will leverage the ModelMeta store
 * to get the meta information.
 *
 * @param rec a model or record which exposes META property
 */
export function getModelMeta<R extends IRecord<S, T>, S extends ISdk, T extends IModel>(rec: R): IFmModelMeta<T> {
  const localMeta = rec.META;
  const modelMeta = keys(meta).includes(rec.modelName) ? meta[rec.modelName] : {};
  return localMeta && localMeta.properties ? localMeta : modelMeta as unknown as IFmModelMeta<T>;
}

export function modelsWithMeta() {
  return Object.keys(meta);
}