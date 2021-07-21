import { Record } from "@/core";
import { IDictionary } from "common-types";
import { keys } from "native-dash";
import { IFmModelMeta, IModel, ISdk } from "@forest-fire/types";

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
export function getModelMeta<S extends ISdk, T extends IModel>(rec: Record<S, T>): IFmModelMeta<T> {
  const localMeta = rec.META;
  const modelMeta = keys(meta).includes(rec.modelName) ? meta[rec.modelName] : {};
  return localMeta && localMeta.properties ? localMeta : modelMeta as unknown as IFmModelMeta<T>;
}

export function modelsWithMeta(): string[] {
  return Object.keys(meta);
}