import { IDictionary } from "common-types";
import { MutationTree } from 'vuex';
import { IFiremodelState } from '~/types';

export type StoreWithPlugin<T extends IDictionary = IDictionary> = T & {
  '@firemodel': IFiremodelState;
};
export type FireModelMutationTree<T extends StoreWithPlugin = StoreWithPlugin> = MutationTree<T>;

export type IState<T> = Record<string, unknown> & { [key: string]: T[] };