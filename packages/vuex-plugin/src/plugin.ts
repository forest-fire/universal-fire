import type { IFiremodelConfig, IFiremodelState, StoreWithPlugin } from '~/types';
import { addNamespace, setInitialState, storeDatabase, storePluginConfig } from '~/util';

import { FireModel } from 'firemodel';
import type { IDatabaseSdk, ISdk } from 'universal-fire';
import copy from 'fast-copy';
import { preserveStore } from '~/util';
import { queueLifecycleEvents } from './queueLifecycleEvents';
import { coreServices } from './coreServices';
import { FireModelPluginError } from './errors';
import { FmConfigAction } from './enums';
import { FiremodelModule } from './store';
import { IDictionary } from 'common-types';
import { Store } from 'vuex';

/**
 * **FiremodelPlugin**
 *
 * @param db the database connection (provided by SDK from `universal-fire`)
 * @param config the configuration of the core services this plugin provides
 */
export const FiremodelPlugin = <TSdk extends ISdk, TStore extends IDictionary = IDictionary>(
  /**
   * Provide a connection to the database with one of the SDK's provided
   * by the `universal-fire` library.
   */
  db: IDatabaseSdk<TSdk>,
  /**
   * Specify the configuration of the "core services" this plugin provides
   */
  config: IFiremodelConfig<StoreWithPlugin<TStore>>
) => {
  storeDatabase(db);
  storePluginConfig(config);
  return (store: Store<StoreWithPlugin<TStore>>) => {
    setInitialState(copy(store.state));
    preserveStore(store);
    FireModel.dispatch = store.dispatch;

    store.subscribe((mutation, state) => {
      if (mutation.type === 'route/ROUTE_CHANGED') {
        store.dispatch(addNamespace(FmConfigAction.watchRouteChanges), {
          ...mutation.payload,
        });
      }
    });

    store.registerModule('@firemodel', FiremodelModule<StoreWithPlugin<TStore>>());

    queueLifecycleEvents<StoreWithPlugin<TStore>>(store, config)
      .then(() => coreServices(store, { ...{ connect: true }, ...config }))
      .catch((e) => {
        throw new FireModelPluginError(
          `Problem setting queuing lifecycle events: ${e.message}`,
          'lifecycle-queuing'
        );
      });
  };
};
