import { GetterTree, Module } from 'vuex';
import { firemodelMutations } from '~/index';

import { Company } from '../models/Company';
import { IRootState } from './index';

export type ICompaniesState = {
  all: Company[];
};

export const state: ICompaniesState = {
  all: [],
};

export const getters: GetterTree<ICompaniesState, IRootState> = {};

const companiesModule: Module<ICompaniesState, IRootState> = {
  state,
  mutations: firemodelMutations(),
  getters,
  namespaced: true,
};

export default companiesModule;
