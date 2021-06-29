import { IFirebaseEventHandler, QueryValue } from '../../../../@types';
import {
  IMockStore,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
  IRtdbQuery,
  IRtdbReference,
  RtdbOrder,
  SDK,
} from '@forest-fire/types';
import { leafNode, runQuery } from '../../../../util';

import { IDictionary } from 'common-types';
import { SnapShot } from './SnapShot';
import { ISerializedQuery } from '@forest-fire/types';
import { DataSnapshot } from '@firebase/database-types';
export abstract class Query<T = any> implements IRtdbQuery {
  public path: string;
  protected _store: IMockStore<SDK.RealTimeAdmin | SDK.RealTimeClient>;
  protected _query: ISerializedQuery<SDK.RealTimeAdmin | SDK.RealTimeClient>;

  constructor(
    path: string | ISerializedQuery<SDK.RealTimeAdmin | SDK.RealTimeClient>,
    store: IMockStore<SDK.RealTimeAdmin | SDK.RealTimeClient>
  ) {
    this._store = store;
    this.path = typeof path === 'string' ? path : this._query.path;
    this._query = typeof path === 'string' ? this._query.setPath(path) : path;
  }

  public onDisconnect(): any {
    return {};
  }

  public remove(onComplete?: (a: Error) => any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public set(value: any, onComplete?: (a: Error) => any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  setPriority(
    priority: string | number,
    onComplete: (a: Error) => any
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  setWithPriority(
    newVal: any,
    newPriority: string | number,
    onComplete?: (a: Error) => any
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }
  update(
    values: Record<string, unknown>,
    onComplete?: (a: Error) => any
  ): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public get ref(): IRtdbReference {
    return this as unknown as IRtdbReference;
  }

  public get(): Promise<DataSnapshot> {
    // TODO: Implement
    return {} as Promise<DataSnapshot>;
  }

  public startAfter(value: QueryValue, key?: string): Query<T> {
    // NOT implmented
    return this;
  }

  public endBefore(value: QueryValue, key?: string): Query<T> {
    // NOT implemented
    return this;
  }

  public limitToLast(num: number): Query<T> {
    this._query.limitToLast(num);

    return this as Query<T>;
  }

  public limitToFirst(num: number): Query<T> {
    this._query.limitToFirst(num);

    return this;
  }

  public transaction(
    transactionUpdate: (a: any) => any,
    onComplete?: (a: Error | null, b: boolean, c: DataSnapshot | null) => any,
    applyLocally?: boolean
  ): Promise<any> {
    throw new Error('not implemented');
  }

  public equalTo(value: QueryValue, key?: Extract<keyof T, string>): Query<T> {
    if (key && this._query.identity.orderBy === RtdbOrder.orderByKey) {
      throw new Error(
        `You can not use "equalTo(val, key)" with a "key" property defined when using a key sort!`
      );
    }
    this._query.equalTo(value, key);

    return this as Query<T>;
  }
  /** Creates a Query with the specified starting point. */
  public startAt(value: QueryValue, key?: string): Query<T> {
    this._query.startAt(value, key);

    return this as Query<T>;
  }

  public endAt(value: QueryValue, key?: string): Query<T> {
    this._query.endAt(value, key);

    return this;
  }

  /**
   * Setup an event listener for a given eventType
   */
  public on(
    eventType: IRtdbDbEvent,
    callback: (a: IRtdbDataSnapshot, b?: null | string) => any,
    cancelCallbackOrContext?: (err?: Error) => void | null,
    context?: Record<string, unknown> | null
  ) {
    this._store.addListener(
      this._query,
      eventType,
      callback,
      cancelCallbackOrContext,
      context
    );
    return callback;
  }

  public async once(eventType: 'value'): Promise<IRtdbDataSnapshot> {
    await this._store.networkDelay();
    return this.getQuerySnapShot();
  }

  public off() {
    console.log('off() not implemented yet on Firemock');
  }

  /**
   * Returns a boolean flag based on whether the two queries --
   * _this_ query and the one passed in -- are equivalen in scope.
   */
  public isEqual(other: Query) {
    return this._query.hashCode() === other._query.hashCode();
  }

  /**
   * When the children of a query are all objects, then you can sort them by a
   * specific property. Note: if this happens a lot then it's best to explicitly
   * index on this property in the database's config.
   */
  public orderByChild(prop: string): Query<T> {
    this._query.orderByChild(prop);

    return this;
  }

  /**
   * When the children of a query are all scalar values (string, number, boolean), you
   * can order the results by their (ascending) values
   */
  public orderByValue(): Query<T> {
    this._query.orderByValue();

    return this;
  }

  /**
   * order is based on the order of the
   * "key" which is time-based if you are using Firebase's
   * _push-keys_.
   *
   * **Note:** this is the default sort if no sort is specified
   */
  public orderByKey(): Query<T> {
    this._query.orderByKey();

    return this;
  }

  /** NOT IMPLEMENTED */
  public orderByPriority(): Query {
    return this;
  }

  public toJSON() {
    return {
      identity: this.toString(),
      query: this._query.identity as IDictionary,
    };
  }

  public toString() {
    return `FireMock::Query@${process.env.FIREBASE_DATA_ROOT_URL}/${this.path}`;
  }

  /**
   * This is an undocumented API endpoint that is within the
   * typing provided by Google
   */
  protected abstract getKey(): string | null;
  /**
   * This is an undocumented API endpoint that is within the
   * typing provided by Google
   */
  protected abstract getParent(): IRtdbQuery;
  /**
   * This is an undocumented API endpoint that is within the
   * typing provided by Google
   */
  protected abstract getRoot(): Query<T>;

  protected abstract addListener(
    pathOrQuery:
      | string
      | ISerializedQuery<SDK.RealTimeAdmin | SDK.RealTimeClient>,
    eventType: IRtdbDbEvent,
    callback: IFirebaseEventHandler,
    cancelCallbackOrContext?: (err?: Error) => void,
    context?: IDictionary
  ): Promise<IRtdbDataSnapshot>;

  /**
   * Reduce the dataset using _filters_ (after sorts) but do not apply sort
   * order to new SnapShot (so natural order is preserved)
   */
  private getQuerySnapShot() {
    const path = this._query.path || this.path;
    const data = this._store.getDb(path);
    const results = runQuery(this._query, data);

    return new SnapShot(
      this._store,
      leafNode(this._query.path),
      results ? results : null
    );
  }
}
