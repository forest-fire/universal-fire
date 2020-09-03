import { FireMockError } from '@/errors';
import {
  ApiKind,
  IDatabaseConfig,
  SDK,
  IMockStore,
  IAdminRtdbDatabase,
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
  private _store: IMockStore<TState>;

  constructor(sdk: SDK, config: IDatabaseConfig, store: IMockStore<TState>) {
    this._sdk = sdk;
    this._dbConfig = config;
    const kind = sdk === SDK.RealTimeAdmin ? ApiKind.admin : ApiKind.client;
    this._store = store;
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

  public ref(path?: string | Reference) {
    return typeof path === 'string' ? new Reference(path) : path;
  }

  public refFromURL(path: string): Reference {
    // TODO: look into how best to implement this
    throw new FireMockError(
      `refFromURL() is not yet supported on Admin API for RTDB.`,
      'not-implemented'
    );
  }
}
