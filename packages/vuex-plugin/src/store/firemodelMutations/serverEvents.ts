import { IFmWatchEvent, IModel } from 'firemodel';
import { changeRoot, isList, updateList } from '~/util';

import { FmCrudMutation } from '~/enums';
import { MutationTree } from 'vuex';
import { ISdk } from 'universal-fire';

export function serverEvents<T extends IModel>(propOffset?: keyof T & string): MutationTree<T> {
  const offset = !propOffset ? ('all' as keyof T & string) : propOffset;
  return {
    [FmCrudMutation.serverAdd](
      /**
       * either a dictionary which includes the "offsetProp" or the array
       * of records at the root of the state structure
       */
      state: T,
      payload: IFmWatchEvent<ISdk, T>
    ) {
      if (isList(state, payload)) {
        updateList<T>(state, offset, payload.value);
      } else {
        changeRoot<T>(state, payload.value, payload.localPath);
      }
    },

    [FmCrudMutation.serverChange](
      /**
       * Either a dictionary which includes the "offsetProp" or the array
       * of records at the root of the state structure
       */
      state: T,
      payload: IFmWatchEvent<ISdk, T>
    ) {
      if (payload.value === null) {
        // a "remove" event will also be picked up by the "change" event
        // passed by Firebase. This mutation will be ignored with the
        // assumption that the "remove" mutation will handle the state
        // change.
        return;
      }
      if (isList(state, payload)) {
        updateList<T>(state, offset, payload.value);
      } else {
        changeRoot<T>(state, payload.value, payload.localPath);
      }
    },

    [FmCrudMutation.serverRemove](
      /**
       * either a dictionary which includes the "offsetProp" or the array
       * of records at the root of the state structure
       */
      state: T,
      payload: IFmWatchEvent<ISdk, T>
    ) {
      if (isList(state, payload)) {
        updateList<T>(state, offset, payload.value);
      } else {
        changeRoot(state, null, payload.localPath);
      }
    },
  };
}
