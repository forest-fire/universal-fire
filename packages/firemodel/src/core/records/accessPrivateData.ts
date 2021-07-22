import { ISdk } from "@forest-fire/types";
import { Model } from "~/models/Model";
import { IModel } from "~/types";
import { Record } from "~/core";

export function accessPrivateData<S extends ISdk, T extends Model>(rec: Record<S, T>): Omit<Record<S, T>, "_data"> & { _data: IModel<T> } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rec as any) as Omit<Record<S, T>, "_data"> & { _data: IModel<T> };
}