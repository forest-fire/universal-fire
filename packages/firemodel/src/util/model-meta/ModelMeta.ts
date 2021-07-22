import { Record } from "~/core";
import { IDictionary } from "common-types";
import { keys } from "native-dash";
import { ISdk } from "@forest-fire/types";
import { IFmModelMeta, } from "~/types";
import { Model } from "~/models/Model";

const meta: IDictionary<IFmModelMeta> = {};

export function addModelMeta(
  modelName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: IFmModelMeta<any>
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
export function getModelMeta<S extends ISdk, T extends Model>(rec: Record<S, T>): IFmModelMeta<T> {
  const localMeta = rec.META;
  const modelMeta = keys(meta).includes(rec.modelName) ? meta[rec.modelName] : {};
  return localMeta && localMeta.properties ? localMeta : modelMeta as unknown as IFmModelMeta<T>;
}

export function modelsWithMeta(): string[] {
  return Object.keys(meta);
}