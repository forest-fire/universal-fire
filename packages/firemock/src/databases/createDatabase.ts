import {
  IDatabaseSdk,
  IFirestoreDatabase,
  IMockDelayedState,
  IMockStore,
  IRtdbDatabase,
  isClientSdk,
} from '@forest-fire/types';
import { FireMockError } from '../errors';
import { createStore } from './createStore';
import { FirestoreAdminMock, FirestoreClientMock } from './firestore';
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
  container: IDatabaseSdk,
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
  const firestore = isClientSdk(container)
    ? new FirestoreClientMock(container.sdk, container.config, store)
    : new FirestoreAdminMock(container.sdk, container.config, store);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return isRtdbBacked(container) ? [rtdb, store] as any : [firestore, store] as any;
  // return rtdb;
}
function isFirestoreBacked(container: any): boolean {
  throw new Error('Function not implemented.');
}

function isRtdbBacked(container: IDatabaseSdk): boolean {
  throw new Error('Function not implemented.');
}

