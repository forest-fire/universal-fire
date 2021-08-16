import type { IFiremodelState } from '~/types';
import { IFmWatcherStopped, IWatcherEventContext } from 'firemodel';

import { MutationTree } from 'vuex';
import Vue from 'vue';
import { FmConfigMutation } from '~/enums';
import { ISdk } from 'universal-fire';

export const watcher = <T>() =>
  ({
    [FmConfigMutation.watcherStarting](
      state: IFiremodelState,
      payload: IWatcherEventContext<ISdk>
    ) {
      // nothing to do
    },

    [FmConfigMutation.watcherStarted](state: IFiremodelState, payload: IWatcherEventContext<ISdk>) {
      Vue.set(state, 'watching', state.watching ? state.watching.concat(payload) : [payload]);
    },

    [FmConfigMutation.watcherStopped](state: IFiremodelState, payload: IFmWatcherStopped) {
      state.watching = state.watching.filter((i) => i.watcherId !== payload.watcherId);
    },
    [FmConfigMutation.watcherAllStopped](state: IFiremodelState, payload) {
      state.watching = [];
    },

    [FmConfigMutation.watcherMuted](state: IFiremodelState, watcherId: string) {
      state.muted = state.muted.concat(watcherId);
    },

    [FmConfigMutation.watcherUnmuted](state: IFiremodelState, watcherId: string) {
      state.muted = state.muted.filter((i) => i !== watcherId);
    },
  } as MutationTree<IFiremodelState>);
