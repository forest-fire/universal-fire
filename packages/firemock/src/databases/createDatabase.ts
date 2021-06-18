import {
  IDatabaseSdk,
  IDb,
  IFirestoreDatabase,
  IFirestoreDbEvent,
  IFirestoreQueryDocumentSnapshot,
  IMockDelayedState,
  IMockStore,
  IRtdbDatabase,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
  isClientSdk,
  ISdk,
  isFirestoreDatabase,
  ISnapshot,
} from '@forest-fire/types';
import { isRealTimeDatabase } from '@forest-fire/types/src';
import { IDictionary } from 'common-types';
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
export function createDatabase<
  TDatabase extends IDatabaseSdk<TSdk>,
  TSdk extends ISdk
>(
  container: TDatabase,
  initialState: IDictionary | IMockDelayedState<IDictionary>
): [TDatabase, IMockStore<TSdk>] {
  const store = createStore(container, initialState);

  if (isFirestoreDatabase(container)) {
    throw new FireMockError(
      `Attempt to mock a Firestore database failed because this has not been implemented yet!`
    );
  }

  // TODO: types are forced and need more investigation
  return (isClientSdk(container)
    ? [createRtdbClientMock(store), store]
    : [createRtdbAdminMock(store), store]) as unknown as [TDatabase, IMockStore<TSdk>]

}


