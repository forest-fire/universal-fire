import { IDictionary } from "common-types";
import { IFiremodelState } from "~/types";

export type StoreWithPlugin<T extends IDictionary = IDictionary> = T & { '@firemodel': IFiremodelState };
