import { FireMockError } from '@/errors';
import {
  IAbstractedDatabase,
  IFirestoreDatabase,
  IMockDelayedState,
  IMockStore,
  IRtdbDatabase,
  isRtdbBacked,
  isFirestoreBacked,
  isClientSdk,
} from '@forest-fire/types';
import { createStore } from './createStore';
import {
  createRtdbClientMock,
  createRtdbAdminMock,
} from './rtdb/factories/index';

/**
 * A factory object which returns an implementation to handle either RTDB or
 * Firestore database as well as distinguishing between the minor variance between
 * admin and client SDK's
 */
export function createDatabase<TState>(
  container: IAbstractedDatabase,
  initialState: TState | IMockDelayedState<TState>
): [IRtdbDatabase | IFirestoreDatabase, IMockStore<TState>] {
  const store = createStore<TState>(container, initialState);

  // TODO: implement mock for Firestore!
  if (isFirestoreBacked(container)) {
    throw new FireMockError(
      `Attempt to mock a Firestore database failed because this has not been implemented yet!`
    );
  }
  const rtdb = isClientSdk(container)
    ? createRtdbClientMock(store)
    : createRtdbAdminMock(store);
  // const firestore = isClientSdk(container)
  //   ? new FirestoreClientMock(container.sdk, container.config, store)
  //   : new FirestoreAdminMock(container.sdk, container.config, store);

  // return isRtdbBacked(container) ? [rtdb, store] : [firestore, store];
  return rtdb;
}
