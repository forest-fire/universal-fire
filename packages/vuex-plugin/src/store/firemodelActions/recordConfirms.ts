import type { IFiremodelState, StoreWithPlugin } from "~/types";
import { FmEvents, IFmWatchEvent } from "firemodel";

import { ActionTree } from "vuex";
import { determineLocalStateNode } from "~/util";
import { FmCrudMutation } from "~/enums";
import { ISdk } from "../../../../types/dist/types";

export const recordConfirms = <T>() =>
({
  [FmEvents.RECORD_ADDED_CONFIRMATION](
    { commit, state },
    payload: IFmWatchEvent<ISdk>
  ) {
    commit(FmCrudMutation.serverAddConfirm, payload);
    commit(
      determineLocalStateNode(payload, FmCrudMutation.serverAddConfirm),
      payload,
      {
        root: true
      }
    );
  },

  [FmEvents.RECORD_CHANGED_CONFIRMATION](
    { commit, state },
    payload: IFmWatchEvent<ISdk>
  ) {
    commit(FmCrudMutation.serverChangeConfirm, payload);
    commit(
      determineLocalStateNode(payload, FmCrudMutation.serverChangeConfirm),
      payload,
      {
        root: true
      }
    );
  },

  [FmEvents.RECORD_REMOVED_CONFIRMATION](
    { commit, state },
    payload: IFmWatchEvent<ISdk>
  ) {
    commit(FmCrudMutation.serverRemoveConfirm, payload);
    commit(
      determineLocalStateNode(payload, FmCrudMutation.serverChangeRollback),
      payload,
      {
        root: true
      }
    );
  }
} as ActionTree<StoreWithPlugin<T>, T>);
