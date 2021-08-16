import { changeRoot, isRecord } from "~/util";

import { FmCrudMutation } from "~/enums";
import { IDictionary } from "common-types";
import { IFmWatchEvent, Model } from 'firemodel';
import { MutationTree } from 'vuex';
import Vue from 'vue';
import { ISdk } from 'universal-fire';

export function watchEvents<TState extends IDictionary<T[]>, T extends Model>(
  propOffset?: keyof TState & string
): MutationTree<TState> {
  const offset = !propOffset ? ('all' as keyof TState & string) : propOffset;

  return {
    /**
     * Bring in the server's current state at the point that a
     * watcher has been setup.
     */
    [FmCrudMutation.serverStateSync](state: T | IDictionary<T[]>, payload: IFmWatchEvent<ISdk, T>) {
      if (isRecord(state, payload)) {
        changeRoot<T>(state, payload.value, payload.localPath);
      } else {
        Vue.set(state, offset, payload.value);
      }
    },
  };
}
