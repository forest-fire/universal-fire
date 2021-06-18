/* eslint-disable @typescript-eslint/no-empty-function */
import { DbFrom, IMockStore } from '@forest-fire/types';
import { url } from 'common-types';

import { reference } from '../index';
import { createClientApp } from '../../firebase-app';


export const createRtdbClientMock = <T extends IMockStore<TSdk>, TSdk extends "RealTimeAdmin" | "RealTimeClient">(store: T): DbFrom<TSdk> => {
  const db: DbFrom<TSdk> = {
    app: createClientApp(store),
    ref: () => {
      return reference(store, null);
    },
    refFromURL(url: url) {
      return reference(store, url);
    },
    goOffline() { },
    goOnline() { },
  };


  return db;
};
