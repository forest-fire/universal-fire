import type { IFiremodelState, StoreWithPlugin } from "~/types";
import { FmEvents, IFmWatchEvent } from "firemodel";

import { ActionTree } from "vuex";
import { determineLocalStateNode } from "~/util";
import { FmCrudMutation } from "~/enums";
import { ISdk } from "universal-fire";

export const recordRollbacks = <T>() =>
({
  [FmEvents.RECORD_ADDED_ROLLBACK](
    { commit, state },
    payload: IFmWatchEvent<ISdk>
  ) {
    commit(FmCrudMutation.serverAddRollback, payload);
    commit(
      determineLocalStateNode(payload, FmCrudMutation.serverAddRollback),
      payload,
      {
        root: true
      }
    );
  },
  [FmEvents.RECORD_CHANGED_ROLLBACK](
    { commit, state },
    payload: IFmWatchEvent<ISdk>
  ) {
    commit(FmCrudMutation.serverChangeRollback, payload);
    commit(
      determineLocalStateNode(payload, FmCrudMutation.serverChangeRollback),
      payload,
      {
        root: true
      }
    );
  },
  [FmEvents.RECORD_REMOVED_ROLLBACK](
    { commit, state },
    payload: IFmWatchEvent<ISdk>
  ) {
    commit(FmCrudMutation.serverRemoveRollback, payload);
    commit(
      determineLocalStateNode(payload, FmCrudMutation.serverRemoveRollback),
      payload,
      {
        root: true
      }
    );
  }
} as ActionTree<IFiremodelState, T>);
