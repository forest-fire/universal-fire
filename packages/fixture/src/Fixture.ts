import { IDictionary } from 'common-types';
import {
  Queue,
  Schema,
  Deployment,
  getFakerLibrary,
  importFakerLibrary,
} from '~/index';

import {
  FirebaseNamespace,
  IMockAuthConfig,
  IAdminAuth,
  IMockConfigOptions,
  AsyncMockData,
  SDK,
  IClientAuth,
} from '@forest-fire/types';

export { SDK };

export class Fixture<TAuth extends IClientAuth | IAdminAuth = IClientAuth> {
  /**
   * returns a Mock object while also ensuring that the
   * Faker library has been asynchronously imported.
   */
  public static async prepare<
    TAuth extends IClientAuth | IAdminAuth = IClientAuth
  >(
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    options: IMockConfigOptions = {},
    /**
     * The Firebase SDK which invoked this Mock DB
     */
    sdk: SDK = SDK.RealTimeClient
  ) {
    const defaultDbConfig = {};
    await importFakerLibrary();

    const obj = new Fixture<TAuth>(
      options.db
        ? typeof options.db === 'function'
          ? {}
          : options.db || defaultDbConfig
        : defaultDbConfig,
      options.auth,
      sdk
    );

    if (options.auth) {
      await initializeAuth(options.auth);
    }

    if (typeof options.db === 'function') {
      obj.updateDB(await (options.db as AsyncMockData)(obj));
    }

    return obj;
  }

  public get db() {
    return getDb();
  }

  public get deploy() {
    return new Deployment();
  }

  // TODO: should these attributes be removed?
  private _schemas = new Queue<ISchema>('schemas').clear();
  private _relationships = new Queue<IRelationship>('relationships').clear();
  private _queues = new Queue<IQueue>('queues').clear();
  private _mockInitializer: IMockSetup;
  private _fakerLoaded: Promise<any>;

  private _hasConnectedToAuth: boolean = false;

  constructor(
    /**
     * Allows the initial **state** of the database to be specified. Either
     * _synchronously_ as a dictionary passed in or as function returning
     * a Promise to the database's state.
     *
     * When choosing the _asynchronous_ approach the function will be passed
     * an instance of
     *
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    mockData?: IDictionary | IMockSetup,
    /**
     * Provides configuration for the AUTH mocking.
     */
    mockAuth: IMockAuthConfig = {
      providers: ['anonymous'],
      users: [],
    },
    /**
     * indicates which database and SDK (aka, client/admin) that has requested
     * this mock db.
     */
    protected sdk: SDK = SDK.RealTimeClient
  ) {
    Queue.clearAll();
    clearDatabase();
    clearAuthUsers();
    if (mockData && typeof mockData === 'object') {
      this.updateDB(mockData);
    }
    if (mockData && typeof mockData === 'function') {
      this._mockInitializer = mockData(this) as IMockSetup;
    }

    initializeAuth(mockAuth);
  }

  /**
   * Update -- _non-desctructively_ -- the mock DB with a JS object/hash
   */
  public updateDB(
    /** the _new_ state that will be updated with the old */
    stateUpdate: IDictionary,
    /** optionally clear the DB before applying the update */
    clearFirst?: boolean
  ) {
    if (clearFirst) {
      clearDatabase();
    }
    updateDatabase(stateUpdate);
  }

  /**
   * silences the database from sending events;
   * this is not typically done but can be done
   * as part of the Mocking process to reduce noise
   */
  public silenceEvents() {
    silenceEvents();
  }

  /**
   * returns the database to its default state of sending
   * events out.
   */
  public restoreEvents() {
    restoreEvents();
  }

  /**
   * Gives access to the appropriate Auth SDK (aka, _client_ or _admin_
   * based on the SDK which originated this Mock database)
   */
  public async auth(): Promise<TAuth> {
    if (!this._hasConnectedToAuth) {
      await networkDelay();
      this._hasConnectedToAuth = true;
    }

    // TODO: This typing is a temporary hack until we refactor `Mock` away from
    // property mocking or there's more time to address a semi-perm solution with
    // better typing
    return (([SDK.FirestoreAdmin, SDK.RealTimeAdmin].includes(this.sdk)
      ? adminAuthSdk
      : clientAuthSdk) as unknown) as TAuth;
  }

  // TODO: this should _not_ be on the API surface; this should be refactored in
  // movement
  public async adminSdk(): Promise<IAdminAuth> {
    return adminAuthSdk;
  }

  public get authProviders(): FirebaseNamespace['auth'] {
    return AuthProviders as FirebaseNamespace['auth'];
  }

  /**
   * returns an instance static FakerJS libraray
   */
  public get faker() {
    return getFakerLibrary();
  }

  public addSchema<S = any>(schema: string, mock?: SchemaCallback<S>) {
    return new Schema<S>(schema, mock);
  }

  /** Set the network delay for queries with "once" */
  public setDelay(d: DelayType) {
    setNetworkDelay(d);
  }

  public queueSchema<T = any>(
    schemaId: string,
    quantity: number = 1,
    overrides: IDictionary = {}
  ) {
    const d = new Deployment();
    d.queueSchema(schemaId, quantity, overrides);
    return d;
  }

  public generate() {
    const faker = getFakerLibrary();
    if (!faker && !faker.address) {
      throw new FireMockError(
        `The Faker library must be loaded before you can generate mocked data can be returned`,
        'firemock/faker-not-ready'
      );
    }

    return new Deployment().generate();
  }

  public ref<T = any>(dbPath: string) {
    return new Reference<T>(dbPath);
  }
}
