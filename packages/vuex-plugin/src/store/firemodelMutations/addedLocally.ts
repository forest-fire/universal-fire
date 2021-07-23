import { changeRoot, isRecord, updateList } from "~/util";

import { FmCrudMutation } from "~/enums";
import { IDictionary } from "common-types";
import { IFmWatchEvent, IModel, Model } from "firemodel";
import { MutationTree } from "vuex";
import { ISdk } from "universal-fire";

export function addedLocally<T>(
  propOffset?: keyof T & string
): MutationTree<T> {
  const offset = !propOffset ? ("all" as keyof T & string) : propOffset;

  return {
    [FmCrudMutation.addedLocally](
      state: IModel<T> | IDictionary<IModel<T>[]>,
      payload: IFmWatchEvent<ISdk, T>
    ) {
      if (isRecord(state, payload)) {
        changeRoot(state, payload.value, payload.localPath);
      } else {
        updateList(state, offset, payload.value);
      }
    },

    [FmCrudMutation.changedLocally](state, payload: IFmWatchEvent<T>) {
      if (isRecord(state, payload)) {
        changeRoot<T>(state, payload.value, payload.localPath);
      } else {
        updateList<T>(state, offset, payload.value);
      }
    },

    [FmCrudMutation.removedLocally](state: T, payload: IFmWatchEvent<T>) {
      if (isRecord(state, payload)) {
        changeRoot<T>(state, null, payload.localPath);
      } else {
        updateList<T>(state, offset, null);
      }
    }
  };
}
