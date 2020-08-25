export * from './proxy-symbols';
import {
  IFirestoreAdmin,
  IFirestoreClient,
  IRealTimeAdmin,
  IRealTimeClient,
} from './proxy-symbols';

import { FirestoreAdmin as FSA } from '@forest-fire/firestore-admin';
import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';
import { IClientConfig, IAdminConfig } from '@forest-fire/types';
import { ISdkFactory } from './ISdkFactory';

/**
 * **FirestoreClient** gives you access to the _Firestore_ database through Firebase's
 * _Client_ SDK. This is intended to be used in frontend/browser based applications where
 * the app can not be trusted to hold secrets.
 *
 * To use this SDK, you should install the following **dependencies** in your app:
 * - `@firebase/app`
 * - `@firebase/firestore`
 * - optionally, `@firebase/auth` if you plan on using Firebase's auth system
 *
 * You should also include the following **devDependencies**:
 * - `@firebase/app-types`
 * - `@firebase/firestore-types`
 * - `@firebase/auth-types`
 *
 * You may also optionally install the `firemock` library if you want to use the mock database
 * capabilities that `universal-fire` provides.
 */
export const FirestoreClient: ISdkFactory<IFirestoreClient, IClientConfig> = {
  create(config) {
    throw new Error(
      'You are using the node entry point for universal-fire; use FirestoreAdmin instead.'
    );
  },

  async connect(config) {
    throw new Error(
      'You are using the node entry point for universal-fire; use FirestoreAdmin instead.'
    );
  },
};
/**
 * **RealTimeClient** gives you access to the _Real-Time_ database through Firebase's
 * Client SDK. This is intended to be used in frontend/browser based applications where
 * the app can not be trusted to hold secrets.
 *
 * To use this SDK, you should install the following **dependencies** in your app:
 * - `@firebase/app`
 * - `@firebase/database`
 * - optionally, `@firebase/auth` if you plan on using Firebase's auth system
 *
 * You should also include the following **devDependencies**:
 * - `@firebase/app-types`
 * - `@firebase/database-types`
 * - `@firebase/auth-types`
 *
 * You may also optionally install the `firemock` library if you want to use the mock database
 * capabilities that `universal-fire` provides.
 */
export const RealTimeClient: ISdkFactory<IRealTimeClient, IClientConfig> = {
  create(config) {
    throw new Error(
      'You are using the node entry point for universal-fire; use RealTimeAdmin instead.'
    );
  },

  async connect(config) {
    throw new Error(
      'You are using the node entry point for universal-fire; use RealTimeAdmin instead.'
    );
  },
};

/**
 * **FirestoreAdmin** gives you access to the _Firestore_ database through Firebase's
 * Admin SDK. This is intended to be used in backend environments where the application
 * is able to hold secrets.
 *
 * To use this SDK, you should install the following **dependencies** in your app:
 * - `firebase-admin`
 *
 * You may also optionally install the `firemock` library if you want to use the mock database
 * capabilities that `universal-fire` provides.
 */
export const FirestoreAdmin: ISdkFactory<IFirestoreAdmin, IAdminConfig> = {
  create(config) {
    return new FSA(config);
  },

  async connect(config) {
    return FSA.connect(config);
  },
};

/**
 * **RealTimeAdmin** gives you access to the _Real Time_ database through Firebase's
 * Admin SDK. This is intended to be used in backend environments where the application
 * is able to hold secrets.
 *
 * To use this SDK, you should install the following **dependencies** in your app:
 * - `firebase-admin`
 *
 * You may also optionally install the `firemock` library if you want to use the mock database
 * capabilities that `universal-fire` provides.
 */
export const RealTimeAdmin: ISdkFactory<IRealTimeAdmin, IAdminConfig> = {
  create(config) {
    return new RTA(config);
  },

  async connect(config) {
    return RTA.connect(config);
  },
};
