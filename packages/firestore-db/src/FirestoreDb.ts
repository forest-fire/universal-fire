import { AbstractedDatabase } from '@forest-fire/abstracted-database';
import type {
  IAdminApp,
  IClientApp,
  IFirestoreDatabase,
  IAbstractedDatabase,
  ISerializedQuery,
  IAbstractedEvent,
} from '@forest-fire/types';
import { FireError } from '@forest-fire/utility';
import { IFirestoreDb } from './firestore-types';
import { isFirestoreEvent, FirestoreDbError, VALID_FIRESTORE_EVENTS } from '.';
import type { Mock as IMockApi } from 'firemock';

export abstract class FirestoreDb extends AbstractedDatabase
  implements IFirestoreDb, IAbstractedDatabase<IMockApi> {
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
    idProp: string = 'id'
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

  public async getRecord<T = any>(path: string, idProp: string = 'id') {
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

  /**
   * watch
   *
   * Watch for firebase events based on a DB path or `SerializedQuery` (path plus query elements)
   *
   * @param target a database path or a SerializedQuery
   * @param events an event type or an array of event types (e.g., "value", "child_added")
   * @param cb the callback function to call when event triggered
   */
  public watch(
    target: string | ISerializedQuery,
    events: IAbstractedEvent | IAbstractedEvent[],
    cb: any
  ): void {
    if (events && !isFirestoreEvent(events)) {
      throw new FirestoreDbError(
        `An attempt to watch an event which is not valid for the Firestore database (but likely is for the Real Time database). Events passed in were: ${JSON.stringify(
          events
        )}\n. In contrast, the valid events in Firestore are: ${VALID_FIRESTORE_EVENTS.join(
          ', '
        )}`,
        'invalid-event'
      );
    }

    throw new Error('Not implemented');
  }

  public unWatch(events?: IAbstractedEvent | IAbstractedEvent[], cb?: any) {
    if (events && !isFirestoreEvent(events)) {
      throw new FirestoreDbError(
        `An attempt was made to unwatch an event type which is not valid for the Firestore database. Events passed in were: ${JSON.stringify(
          events
        )}\nIn contrast, the valid events in Firestore are: ${VALID_FIRESTORE_EVENTS.join(
          ', '
        )}`,
        'invalid-event'
      );
    }

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
