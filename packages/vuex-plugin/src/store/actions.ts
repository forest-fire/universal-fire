import { firemodelActions, pluginActions } from '../index';

import { ActionTree } from 'vuex';
import type { IFiremodelState } from '~/types';

export const actions = <T>() =>
  ({
    ...firemodelActions<T>(),
    ...pluginActions<T>(),
  } as ActionTree<IFiremodelState, T>);
