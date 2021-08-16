export * from './proxy-symbols';

import { FirestoreClient as FC } from '@forest-fire/firestore-client';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';

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
 * capabilities that `universal-fire` provides. */
export const FirestoreClient: ISdkFactory<"FirestoreClient"> = {
  create(config) {
    return new FC(config);
  },

  async connect(config) {
    return FC.connect(config);
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
 */
export const RealTimeClient: ISdkFactory<"RealTimeClient"> = {
  create(config) {
    return new RTC(config);
  },

  async connect(config) {
    return RTC.connect(config);
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
export const FirestoreAdmin: ISdkFactory<"FirestoreAdmin"> = {
  create() {
    throw new Error(
      'You are using the client/browser entry point for universal-fire; use FirestoreClient instead.'
    );
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async connect() {
    throw new Error(
      'You are using the client/browser entry point for universal-fire; use FirestoreClient instead.'
    );
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
export const RealTimeAdmin: ISdkFactory<"RealTimeAdmin"> = {
  create() {
    throw new Error(
      'You are using the client/browser entry point for universal-fire; use RealTimeClient instead.'
    );
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async connect() {
    throw new Error(
      'You are using the client/browser entry point for universal-fire; use RealTimeClient instead.'
    );
  },
};
