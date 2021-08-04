import { changeRoot, isList, isRecord, updateList } from '~/util';

import { FmCrudMutation } from '~/enums';
import { IDictionary } from 'common-types';
import { IFmWatchEvent, Model } from 'firemodel';
import { MutationTree } from 'vuex';
import { ISdk } from 'universal-fire';

export function addedLocally<T extends Model>(propOffset?: keyof T & string): MutationTree<T> {
  const offset = !propOffset ? ('all' as keyof T & string) : propOffset;

  return {
    [FmCrudMutation.addedLocally](state: T | IDictionary<T[]>, payload: IFmWatchEvent<ISdk, T>) {
      if (isList(state, payload)) {
        updateList(state, offset, payload.value);
      } else {
        changeRoot(state, payload.value, payload.localPath);
      }
    },

    [FmCrudMutation.changedLocally](state, payload: IFmWatchEvent<ISdk, T>) {
      if (isList(state, payload)) {
        updateList(state, offset, payload.value);
      } else {
        changeRoot(state, payload.value, payload.localPath);
      }
    },

    [FmCrudMutation.removedLocally](state: T, payload: IFmWatchEvent<ISdk, T>) {
      if (isList(state, payload)) {
        updateList(state, offset, null);
      } else {
        changeRoot(state, null, payload.localPath);
      }
    },
  };
}
