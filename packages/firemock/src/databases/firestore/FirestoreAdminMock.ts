import {
  IDatabaseConfig,
  SDK,
  IMockStore,
  IAdminApp,
  IAdminFirestoreDatabase,
} from '@forest-fire/types';

/**
 * A class representing the Firestore Admin SDK's API surface which interacts with the mock
 * database rather than a real DB.
 */
export class FirestoreAdminMock<TState> implements IAdminFirestoreDatabase {
  private _dbConfig: IDatabaseConfig;
  private _sdk: SDK;
  private _store: IMockStore<SDK.FirestoreAdmin>;

  constructor(sdk: SDK, config: IDatabaseConfig, store: IMockStore<SDK.FirestoreAdmin>) {
    this._sdk = sdk;
    this._dbConfig = config;
    this._store = store;
  }
  settings(settings: FirebaseFirestore.Settings): void {
    throw new Error('Method not implemented.');
  }
  collection(collectionPath: string): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> {
    throw new Error('Method not implemented.');
  }
  doc(documentPath: string): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
    throw new Error('Method not implemented.');
  }
  collectionGroup(collectionId: string): FirebaseFirestore.CollectionGroup<FirebaseFirestore.DocumentData> {
    throw new Error('Method not implemented.');
  }
  getAll(...documentRefsOrReadOptions: (FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | FirebaseFirestore.ReadOptions)[]): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>[]> {
    throw new Error('Method not implemented.');
  }
  recursiveDelete(ref: FirebaseFirestore.CollectionReference<unknown> | FirebaseFirestore.DocumentReference<unknown>, bulkWriter?: FirebaseFirestore.BulkWriter): Promise<void> {
    throw new Error('Method not implemented.');
  }
  terminate(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  listCollections(): Promise<FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>[]> {
    throw new Error('Method not implemented.');
  }
  runTransaction<T>(updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>, transactionOptions?: FirebaseFirestore.ReadWriteTransactionOptions | FirebaseFirestore.ReadOnlyTransactionOptions): Promise<T> {
    throw new Error('Method not implemented.');
  }
  batch(): FirebaseFirestore.WriteBatch {
    throw new Error('Method not implemented.');
  }
  bulkWriter(options?: FirebaseFirestore.BulkWriterOptions): FirebaseFirestore.BulkWriter {
    throw new Error('Method not implemented.');
  }
  bundle(bundleId?: string): FirebaseFirestore.BundleBuilder {
    throw new Error('Method not implemented.');
  }

  public app: IAdminApp;

  public goOffline() {
    console.log(
      `The mock database [ ${this._sdk} / ${this._dbConfig.databaseURL} ] has gone offline, triggered by call to goOffline()`
    );
  }

  public goOnline() {
    console.log(
      `The mock database [ ${this._sdk} / ${this._dbConfig.databaseURL} ] has gone online, triggered by call to goOnline()`
    );
  }
}
