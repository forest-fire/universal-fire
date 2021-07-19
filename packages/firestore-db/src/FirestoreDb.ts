/* eslint-disable @typescript-eslint/ban-types */
import type {
  IFirestoreDatabase,
  ISerializedQuery,
  IAbstractedEvent,
  IDatabaseSdk,
  IFirestoreSdk,
  DbTypeFrom,
  IDatabaseConfig,
  AuthFrom,
  AppFrom,
  AuthProviders,
  IsAdminSdk,
  IMockDatabase,
  EventFrom,
  IRtdbReference,
  IModel
} from '@forest-fire/types';
import { FireError } from '@forest-fire/utility';
import {
  isFirestoreEvent,
  FirestoreDbError,
  VALID_FIRESTORE_EVENTS,
} from './index';

export abstract class FirestoreDb<TSdk extends IFirestoreSdk>
  implements IDatabaseSdk<TSdk>
{
  abstract dbType: DbTypeFrom<TSdk>;
  abstract sdk: TSdk;
  abstract isAdminApi: IsAdminSdk<TSdk>;
  abstract connect(): Promise<void>;
  abstract auth(): Promise<AuthFrom<TSdk>>;
  public CONNECTION_TIMEOUT: number;
  public get app(): AppFrom<TSdk> {
    if (!this._app) {
      throw new Error(
        `[not-ready] - Failed to return the Firebase "app" as this has not yet been asynchronously loaded yet`
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._app;
  }

  public get authProviders(): AuthProviders<TSdk> {
    throw new FireError(
      `The authProviders getter is intended to provide access to various auth providers but it is NOT implemented in the connection library you are using!`,
      'missing-auth-providers'
    );
  }

  public get config(): IDatabaseConfig {
    return this._config;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  protected _database?: IFirestoreDatabase;
  protected _app!: AppFrom<TSdk>;
  protected _isConnected = false;
  protected _config: IDatabaseConfig
  public isMockDb = false;

  protected get database(): IFirestoreDatabase {
    if (!this._database) {
      throw new FireError(
        'Attempt to use Firestore without having instantiated it',
        'not-ready'
      );
    }

    return this._database;
  }

  protected set database(value: IFirestoreDatabase) {
    this._database = value;
  }

  protected _isCollection(path: string | ISerializedQuery<TSdk>): boolean {
    path = typeof path !== 'string' ? path.path : path;
    return path.split('/').length % 2 === 0;
  }

  protected _isDocument(path: string | ISerializedQuery<TSdk>): boolean {
    return this._isCollection(path) === false;
  }

  public get mock(): IMockDatabase<TSdk> {
    throw new Error('Not implemented');
  }

  public async getList<T extends IModel>(
    path: string | ISerializedQuery<TSdk, T>,
    idProp = 'id'
  ): Promise<T[]> {
    path = typeof path !== 'string' ? path.path : path;
    const querySnapshot = await this.database.collection(path).get();
    return querySnapshot.docs.map((doc) => {
      return {
        [idProp]: doc.id,
        ...doc.data(),
      };
    }) as T[];
  }

  public getPushKey(path: string): Promise<string> {
    return Promise.resolve(this.database.collection(path).doc().id);
  }

  public async getRecord<T = unknown>(path: string, idProp = 'id'): Promise<T> {
    const documentSnapshot = await this.database.doc(path).get();
    return {
      ...documentSnapshot.data(),
      [idProp]: documentSnapshot.id,
    } as T;
  }

  public getValue<T extends unknown = unknown>(_path: string): Promise<T> {
    throw new Error('Not implemented');
  }

  public async update<T extends unknown = unknown>(path: string, value: T): Promise<void> {
    await this.database.doc(path).update(value);
  }

  public async set<T extends unknown>(path: string, value: T): Promise<void> {
    await this.database.doc(path).set(value);
  }

  public async remove(path: string): Promise<void> {
    const pathIsCollection = this._isCollection(path);
    if (pathIsCollection) {
      await this._removeCollection(path);
    } else {
      await this._removeDocument(path);
    }
  }

  /**
   * watch
   *
   * Watch for firebase events based on a DB path or `SerializedQuery` (path plus query elements)
   *
   * @param target a database path or a SerializedQuery
   * @param events an event type or an array of event types (e.g., "value", "child_added")
   * @param _cb the callback function to call when event triggered
   */
  public watch<C extends IModel>(
    target: string | ISerializedQuery<TSdk, C>,
    events: EventFrom<TSdk> | EventFrom<TSdk>[],
    _cb: C
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

  public unWatch(events?: IAbstractedEvent | IAbstractedEvent[], _cb?: any): void {
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

  public ref(path = '/'): IRtdbReference {
    throw new Error('Not implemented');
  }

  private async _removeDocument(path: string) {
    await this.database.doc(path).delete();
  }

  private async _removeCollection(path: string) {
    const batch = this.database.batch();
    this.database.collection(path).onSnapshot((snapshot) => {
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref as never);
      });
    });
    // All or nothing.
    await batch.commit();
  }
}
