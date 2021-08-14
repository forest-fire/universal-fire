/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IDatabaseConfig,
  SDK,
  IMockStore,
  IAdminFirestoreDatabase,
  IClientApp,
  IRtdbReference,
} from '@forest-fire/types';
import { createError } from 'brilliant-errors';

/**
 * A class representing the Firestore Client SDK's API surface which interacts with the mock
 * database rather than a real DB.
 */
export class FirestoreClientMock implements IAdminFirestoreDatabase {
  private _dbConfig: IDatabaseConfig;
  private _sdk: SDK;
  private _store: IMockStore<SDK.FirestoreClient>;

  constructor(
    sdk: SDK,
    config: IDatabaseConfig,
    store: IMockStore<SDK.FirestoreClient>
  ) {
    this._sdk = sdk;
    this._dbConfig = config;
    this._store = store;
  }
  settings(): void {
    throw new Error('Method not implemented.');
  }
  collection(
    _collectionPath: string
  ): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
    throw new Error('Method not implemented.');
  }
  doc(
    _documentPath: string
  ): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
    throw new Error('Method not implemented.');
  }
  collectionGroup(
    _collectionId: string
  ): FirebaseFirestore.CollectionGroup<FirebaseFirestore.DocumentData> {
    throw new Error('Method not implemented.');
  }
  getAll(
    ...documentRefsOrReadOptions: (
      | FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
      | FirebaseFirestore.ReadOptions
    )[]
  ): Promise<
    FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>[]
  > {
    throw new Error('Method not implemented.');
  }
  recursiveDelete(
    ref:
      | FirebaseFirestore.CollectionReference<unknown>
      | FirebaseFirestore.DocumentReference<unknown>,
    bulkWriter?: FirebaseFirestore.BulkWriter
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  terminate(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  listCollections(): Promise<
    FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>[]
  > {
    throw new Error('Method not implemented.');
  }
  runTransaction<T>(
    updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>,
    transactionOptions?:
      | FirebaseFirestore.ReadWriteTransactionOptions
      | FirebaseFirestore.ReadOnlyTransactionOptions
  ): Promise<T> {
    throw new Error('Method not implemented.');
  }
  batch(): FirebaseFirestore.WriteBatch {
    throw new Error('Method not implemented.');
  }
  bulkWriter(
    options?: FirebaseFirestore.BulkWriterOptions
  ): FirebaseFirestore.BulkWriter {
    throw new Error('Method not implemented.');
  }
  bundle(bundleId?: string): FirebaseFirestore.BundleBuilder {
    throw new Error('Method not implemented.');
  }

  public app: IClientApp;

  public goOffline(): void {
    console.log(
      `The mock database [ ${this._sdk} / ${this._dbConfig.databaseURL} ] has gone offline, triggered by call to goOffline()`
    );
  }

  public goOnline(): void {
    console.log(
      `The mock database [ ${this._sdk} / ${this._dbConfig.databaseURL} ] has gone online, triggered by call to goOnline()`
    );
  }

  public refFromURL(path: string): IRtdbReference {
    // TODO: look into how best to implement this
    throw createError(
      'not-implemented',
      `refFromURL() is not yet supported on Admin API for RTDB.`
    );
  }
}
