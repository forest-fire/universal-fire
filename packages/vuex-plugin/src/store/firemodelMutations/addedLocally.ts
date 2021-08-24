import { changeRoot, isList, isRecord, updateList } from '~/util';

import { FmCrudMutation } from '~/enums';
import { IFmWatchEvent, Model } from 'firemodel';
import { MutationTree } from 'vuex';
import { ISdk } from 'universal-fire';
import { IState } from '~/types';

export function addedLocally<
  TState extends IState<T>,
  T extends Model,
  S extends ISdk = 'RealTimeClient'
>(propOffset?: keyof TState & string): MutationTree<TState> {
  const offset = !propOffset ? ('all' as keyof TState & string) : propOffset;

  return {
    [FmCrudMutation.addedLocally](state, payload: IFmWatchEvent<S, T>) {
      if (isList(state, payload)) {
        updateList(state, offset, payload.value);
      } else {
        changeRoot(state, payload.value, payload.localPath);
      }
    },

    [FmCrudMutation.changedLocally](state, payload: IFmWatchEvent<S, T>) {
      if (isRecord(state, payload)) {
        changeRoot(state, payload.value, payload.localPath);
      } else {
        updateList(state, offset, payload.value);
      }
    },

    [FmCrudMutation.removedLocally](state, payload: IFmWatchEvent<S, T>) {
      if (isRecord(state, payload)) {
        changeRoot(state, null, payload.localPath);
      } else {
        updateList<T, TState>(state, offset, { kind: 'remove', id: payload.value?.id });
      }
    },
  };
}
