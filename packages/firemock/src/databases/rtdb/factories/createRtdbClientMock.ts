/* eslint-disable @typescript-eslint/no-empty-function */
import { IClientRtdbDatabase, IMockStore } from '@forest-fire/types';
import { url } from 'common-types';
import { reference } from '../index';
import { createClientApp } from '../../firebase-app';

export function createRtdbClientMock<T extends IMockStore<'RealTimeClient'>>(
  store: T
): IClientRtdbDatabase {
  const db: IClientRtdbDatabase = {
    useEmulator() {},
    get app() {
      return createClientApp(store);
    },
    ref(path?: string) {
      return reference(store, path);
    },
    refFromURL(url: url) {
      return reference(store, url);
    },
    goOffline() {},
    goOnline() {},
  };

  return db;
}
