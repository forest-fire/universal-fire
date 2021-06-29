import { IDictionary } from 'common-types';
import {
  IRtdbReference,
  IRtdbDataSnapshot,
  IRtdbDbEvent,
  IMockStore,
  SDK,
  IModel,
  IGenericModel,
} from '@forest-fire/types';
import { IFirebaseEventHandler } from '../../../../@types';
import { parts, join, slashNotation } from '../../../../util';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { Query } from './Query';
import { SnapShot } from './SnapShot';
import { ISerializedQuery } from '@forest-fire/types';

function isMultiPath(data: IDictionary) {
  Object.keys(data).map((d: any) => {
    if (!d) {
      data[d] = '/';
    }
  });
  const indexesAreStrings = Object.keys(data).every(
    (i) => typeof i === 'string'
  );
  const indexesLookLikeAPath = Object.keys(data).every(
    (i) => i.indexOf('/') !== -1
  );
  return indexesAreStrings && indexesLookLikeAPath ? true : false;
}

export class Reference<
    TSdk extends SDK.RealTimeAdmin | SDK.RealTimeClient,
    T extends IModel = IModel
  >
  extends Query<T>
  implements IRtdbReference
{
  protected addListener(
    pathOrQuery: string | ISerializedQuery<TSdk, IGenericModel>,
    eventType: IRtdbDbEvent,
    callback: IFirebaseEventHandler,
    cancelCallbackOrContext?: (err?: Error) => void,
    context?: IDictionary<any>
  ): Promise<IRtdbDataSnapshot> {
    throw new Error('Method not implemented.');
  }
  protected getParent(): IRtdbReference {
    const r = parts(this.path).slice(-1).join('.');
    return new Reference<SDK.RealTimeAdmin | SDK.RealTimeClient, T>(
      r,
      this._store
    );
  }
  protected getRoot(): Query<T> {
    throw new Error('Method not implemented.');
  }
  protected getKey(): string {
    throw new Error('Method not implemented.');
  }
  public push(
    value?: any,
    onComplete?: (a: Error | null) => any
  ): IRtdbReference & Pick<Promise<IRtdbReference>, 'then' | 'catch'> {
    throw new Error('');
  }
  constructor(path: string | ISerializedQuery<TSdk>, store: IMockStore<TSdk>) {
    super(path, store);
  }
  public root: IRtdbReference;
  public parent: IRtdbReference;

  public get key(): string | null {
    return this.path.split('.').pop();
  }

  public child(path: string): IRtdbReference {
    const r = parts(this.path).concat([path]).join('.');
    return new Reference<SDK.RealTimeAdmin | SDK.RealTimeClient, T>(
      r,
      this._store
    );
  }

  public remove(onComplete?: (a: Error | null) => any): Promise<void> {
    this._store.removeDb(this.path);
    if (onComplete) {
      onComplete(null);
    }
    return this._store.networkDelay();
  }

  public set(value: any, onComplete?: (a: Error | null) => any): Promise<void> {
    this._store.setDb(this.path, value);
    if (onComplete) {
      onComplete(null);
    }
    return this._store.networkDelay();
  }

  public async update(
    values: IDictionary,
    onComplete?: (a: Error | null) => any
  ): Promise<void> {
    if (isMultiPath(values)) {
      this._store.multiPathUpdate(values);
    } else {
      this._store.updateDb(this.path, values);
    }
    if (onComplete) {
      onComplete(null);
    }
    return this._store.networkDelay();
  }

  public async setPriority(
    priority: string | number | null,
    onComplete: (a: Error | null) => any
  ): Promise<void> {
    return this._store.networkDelay();
  }

  public async setWithPriority(
    newVal: any,
    newPriority: string | number | null,
    onComplete: (a: Error | null) => any
  ) {
    return this._store.networkDelay();
  }

  public transaction(
    transactionUpdate: (a: Partial<T>) => Partial<T>,
    onComplete?: (
      a: Error | null,
      b: boolean,
      c: IRtdbDataSnapshot | null
    ) => any,
    applyLocally?: boolean
  ) {
    return Promise.resolve({
      committed: true,
      snapshot: null,
      toJSON() {
        return {};
      },
    });
  }

  public onDisconnect(): any {
    return {};
  }

  public toString() {
    return this.path
      ? slashNotation(join('FireMock::Reference@', this.path, this.key))
      : 'FireMock::Reference@uninitialized (aka, no path) mock Reference object';
  }

  protected getSnapshot<T extends IRtdbDataSnapshot>(key: string, value: any) {
    return new SnapShot<T>(this._store, key, value);
  }
}
