import { FmCrudMutation } from "~/enums";
import { Model } from "firemodel";
import { MutationTree } from "vuex";
import Vue from "vue";
import { getInitialState } from "~/util";
import { IDictionary } from 'common-types';
import { IState } from '~/types';

export function reset<TState extends IState<T>, T extends Model>(
  propOffset?: keyof TState & string
): MutationTree<TState> {
  const offset = !propOffset ? ('all' as keyof TState & string) : propOffset;
  return {
    [FmCrudMutation.reset](state: any, mod: string) {
      if (offset && Array.isArray(state[offset])) {
        Vue.set(state, offset, []);
      } else {
        // TODO: make this reset to "default state" not empty state
        return Object.keys(state).forEach((p) => Vue.set(state, p, getInitialState()[mod][p]));
      }
    },
  };
}
