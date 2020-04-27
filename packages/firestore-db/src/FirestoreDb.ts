import { AbstractedDatabase, MockDb } from '@forest-fire/abstracted-database';
import { DocumentChangeType as IFirestoreDbEvent } from '@firebase/firestore-types';
import {
  ISerializedQuery,
  IFirestoreDatabase,
  IFirebaseApp
} from '@forest-fire/types';

export abstract class FirestoreDb extends AbstractedDatabase {
  protected _database: IFirestoreDatabase | undefined;
  protected _app: IFirebaseApp | undefined;

  protected get database() {
    if (this._database) {
      return this._database;
    }
    throw new Error('Attempt to use Firestore without having instantiated it');
  }

  protected set database(value: IFirestoreDatabase) {
    this._database = value;
  }

  protected _isCollection(path: string | ISerializedQuery) {
    if (typeof path === 'string') {
      return path.split('/').length % 2 === 0;
    }
    // Just for now.
    throw new Error('Serialized queries are not supported by Firestore');
  }

  protected _isDocument(path: string | ISerializedQuery) {
    return this._isCollection(path) === false;
  }

  public get mock(): MockDb {
    throw new Error('Not implemented');
  }

  public async getList<T = any>(
    path: string | ISerializedQuery,
    idProp: string = 'id'
  ) {
    path = typeof path !== 'string' ? path.path : path;
    const querySnapshot = await this.database.collection(path).get();
    return querySnapshot.docs.map(doc => {
      return {
        [idProp]: doc.id,
        ...doc.data()
      };
    }) as T[];
  }

  public async getPushKey(path: string) {
    return this.database.collection(path).doc().id;
  }

  public async getRecord<T = any>(path: string, idProp: string = 'idProp') {
    const documentSnapshot = await this.database.doc(path).get();
    return {
      ...documentSnapshot.data(),
      [idProp]: documentSnapshot.id
    } as T;
  }

  public async getValue<T = any>(path: string) {
    throw new Error('Not implemented');
  }

  public async update<T = any>(path: string, value: Partial<T>) {
    await this.database.doc(path).update(value);
  }

  public async set<T = any>(path: string, value: T) {
    await this.database.doc(path).set({ ...value });
  }

  public async remove(path: string) {
    const pathIsCollection = this._isCollection(path);
    if (pathIsCollection) {
      this._removeCollection(path);
    } else {
      this._removeDocument(path);
    }
  }

  public watch(
    target: string | ISerializedQuery,
    events: IFirestoreDbEvent[],
    cb: any
  ) {
    throw new Error('Not implemented');
  }

  public unWatch(events: IFirestoreDbEvent[], cb?: any) {
    throw new Error('Not implemented');
  }

  public ref(path = '/') {
    throw new Error('Not implemented');
  }

  private async _removeDocument(path: string) {
    await this.database.doc(path).delete();
  }

  private async _removeCollection(path: string) {
    const batch = this.database.batch();
    this.database.collection(path).onSnapshot(snapshot => {
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    });
    // All or nothing.
    await batch.commit();
  }
}
