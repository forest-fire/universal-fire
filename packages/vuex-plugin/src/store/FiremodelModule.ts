import { ICompositeKey, Model } from 'firemodel';
import type { IFmEventActions, IFiremodelState, StoreWithPlugin } from '~/types';
import { actions, mutations, state } from '~/store';
import { Module } from 'vuex';

export function generateLocalId<T extends Model = Model>(
  compositeKey: ICompositeKey<T>,
  action: IFmEventActions
) {
  return action;
}

/**
 * The **Vuex** module that this plugin exports
 */
export const FiremodelModule = <T>(): Module<IFiremodelState, T> => ({
  state: state(),
  mutations: mutations(),
  actions: actions(),
  namespaced: true,
});
