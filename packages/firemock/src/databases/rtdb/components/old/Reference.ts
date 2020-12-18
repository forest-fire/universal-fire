import { IDictionary } from 'common-types';
import type {
  IRtdbReference,
  IRtdbDataSnapshot,
  IRtdbThenableReference,
  IRtdbDbEvent,
  IRtdbQuery,
  IMockStore,
} from '@forest-fire/types';
import { IFirebaseEventHandler } from '@/@types';
import { parts, join, slashNotation, networkDelay } from '@/util';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { Query } from './Query';
import { SnapShot } from './SnapShot';
import { ISerializedQuery } from '@forest-fire/types/src';

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

export class Reference<T = any> extends Query<T>
  implements IRtdbReference, IRtdbQuery {
  constructor(path: string | ISerializedQuery, store: IMockStore<IDictionary>) {
    super(path, store);
  }

  public get key(): string | null {
    return this.path.split('.').pop();
  }

  public get parent(): IRtdbReference | null {
    const r = parts(this.path).slice(-1).join('.');
    return new Reference(r, this._store.getDb(r));
  }

  public child<C = any>(path: string): Reference {
    const r = parts(this.path).concat([path]).join('.');
    return new Reference<C>(r, this._store.getDb(r));
  }

  public get root(): Reference {
    return new Reference('/', this._store.getDb('/'));
  }

  public async push(
    value?: any,
    onComplete?: (a: Error | null) => any
  ): Promise<IRtdbReference> {
    const id = this._store.pushDb(this.path, value);
    this.path = join(this.path, id);
    if (onComplete) {
      onComplete(null);
    }

    await this._store.networkDelay();

    return this as any;
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
    return new SnapShot<T>(key, value);
  }

  protected addListener(
    pathOrQuery: string | SerializedRealTimeQuery<any>,
    eventType: IRtdbDbEvent,
    callback: IFirebaseEventHandler,
    cancelCallbackOrContext?: (err?: Error) => void,
    context?: IDictionary
  ): Promise<IRtdbDataSnapshot> {
    // TODO: get this plugged into store API
    this._store.addListener();
    return addListener(
      pathOrQuery,
      eventType,
      callback,
      cancelCallbackOrContext,
      context
    );
  }
}
