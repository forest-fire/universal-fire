/* eslint-disable @typescript-eslint/no-empty-function */
import { DbFrom, IMockStore } from '@forest-fire/types';
import { url } from 'common-types';
import { reference } from '../index';
import { createClientApp } from '../../firebase-app';

export function createRtdbClientMock<T extends IMockStore<'RealTimeClient'>>(
  store: T
): DbFrom<'RealTimeClient'> {
  const db = {
    useEmulator() {},
    app: createClientApp(store),
    ref: () => {
      return reference(store, null);
    },
    refFromURL(url: url) {
      return reference(store, url);
    },
    goOffline() {},
    goOnline() {},
  };

  return db;
}
