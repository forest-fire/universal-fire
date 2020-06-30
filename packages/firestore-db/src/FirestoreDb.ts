import {
  AbstractedDatabase,
  IAbstractedDatabase,
} from '@forest-fire/abstracted-database';
import type {
  IAdminApp,
  IClientApp,
  IFirestoreDatabase,
  IFirestoreDbEvent,
  SDK,
} from '@forest-fire/types';
import { FireError } from '@forest-fire/utility';
import type {
  SerializedFirestoreQuery,
  ISerializedQuery,
} from '@forest-fire/serialized-query';
import { IFirestoreDb } from './firestore-types';

export abstract class FirestoreDb extends AbstractedDatabase
  implements IFirestoreDb, IAbstractedDatabase {
  protected _database?: IFirestoreDatabase;
  protected _app!: IClientApp | IAdminApp;

  protected get database() {
    if (this._database) {
      return this._database;
    }
    throw new FireError(
      'Attempt to use Firestore without having instantiated it',
      'not-ready'
    );
  }

  protected set database(value: IFirestoreDatabase) {
    this._database = value;
  }

  protected _isCollection(path: string | ISerializedQuery) {
    path = typeof path !== 'string' ? path.path : path;
    return path.split('/').length % 2 === 0;
  }

  protected _isDocument(path: string | ISerializedQuery) {
    return this._isCollection(path) === false;
  }

  public get mock(): any {
    throw new Error('Not implemented');
  }

  public async getList<T = any>(
    path: string | ISerializedQuery<T>,
    idProp: string
  ): Promise<T[]> {
    path = typeof path !== 'string' ? path.path : path;
    const querySnapshot = await this.database.collection(path).get();
    // @ts-ignore
    return querySnapshot.docs.map((doc) => {
      return {
        [idProp]: doc.id,
        ...doc.data(),
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
      [idProp]: documentSnapshot.id,
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
    events: IFirestoreDbEvent | IFirestoreDbEvent[],
    cb: any
  ): void {
    throw new Error('Not implemented');
  }

  public unWatch(events?: IFirestoreDbEvent[], cb?: any) {
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
    // @ts-ignore
    this.database.collection(path).onSnapshot((snapshot) => {
      // @ts-ignore
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
    });
    // All or nothing.
    await batch.commit();
  }
}
