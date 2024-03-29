import * as lifecycle from './lifecycle';

import { AsyncMockData, IAuthConfig, IFiremodelState } from '~/types';
import Vuex, { Store } from 'vuex';
import companies, { ICompaniesState } from './companies';
import orders, { IOrdersState } from './orders';
import products, { IProductsState } from './products';
import userProfile, { IUserProfileState } from './userProfile';

import { FiremodelPlugin } from '~/plugin';
import { IDictionary } from 'common-types';

import { RealTimeClient } from '@forest-fire/real-time-client';
import Vue from 'vue';
import { config } from './config';
import { IClientConfig } from 'universal-fire';

Vue.use(Vuex);

export interface IRootState {
  products: IProductsState;
  userProfiles: IUserProfileState;
  companies: ICompaniesState;
  orders: IOrdersState;
  ['@firemodel']: IFiremodelState;
}

export let store: Store<IRootState>;

/**
 * Store
 *
 * Sets up a Vuex store for testing purposes; note that DB data can be passed in
 * as a parameter
 */
export const setupStore = (data?: IDictionary | AsyncMockData, customConfig?: IClientConfig) => {
  const db = new RealTimeClient(customConfig || config(data));
  store = new Vuex.Store<IRootState>({
    modules: {
      products,
      userProfile,
      companies,
      orders,
    },
    plugins: [
      FiremodelPlugin(db, {
        connect: true,
        auth: true,
        ...lifecycle,
      }),
    ],
  });
  return store;
};
