import { IDictionary } from 'common-types';
import {
  Schema,
  Deployment,
  getFakerLibrary,
  importFakerLibrary,
} from '~/index';

import {
  IMockAuthConfig,
  IAdminAuth,
  IMockConfigOptions,
  SDK,
  IClientAuth,
  AuthProviderName,
  IMockDatabase,
  IRtdbSdk,
} from '@forest-fire/types';
import { SchemaCallback } from './@types';
import { FixtureError } from './errors/FixtureError';

export class Fixture<TSdk extends SDK = SDK.RealTimeClient> {
  db: IMockDatabase<TSdk>;
  schema: Schema;
  /**
   * returns a Mock object while also ensuring that the
   * Faker library has been asynchronously imported.
   */
  public static async prepare<TSdk extends SDK = SDK.RealTimeClient>(
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    options: IMockConfigOptions<TSdk> = {}
  ) {
    const defaultDbConfig = {};
    await importFakerLibrary();

    const obj = new Fixture(options.db, options.auth);

    // if (options.auth) {
    //   await initializeAuth(options.auth);
    // }

    // if (typeof options.db === 'function') {
    //   obj.updateDB(await (options.db as AsyncMockData)());
    // }

    return obj;
  }

  public get deploy() {
    return new Deployment(this.db);
  }

  constructor(
    db: IMockDatabase<TSdk>,
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
    // mockData?: IDictionary,
    /**
     * Provides configuration for the AUTH mocking.
     */
    mockAuth: IMockAuthConfig = {
      providers: [AuthProviderName.anonymous],
      users: [],
    },
    /**
     * indicates which database and SDK (aka, client/admin) that has requested
     * this mock db.
     */
  ) {
    // Queue.clearAll();
    // clearDatabase();
    // clearAuthUsers();
    // if (mockData && typeof mockData === 'object') {
    //   this.db = mockData;
    // }
    // initializeAuth(mockAuth);
    this.db = db;
  }

  /**
   * returns an instance static FakerJS libraray
   */
  public get faker() {
    return getFakerLibrary();
  }

  public addSchema<S = any>(schema: string, mock?: SchemaCallback<S>) {
    this.schema.addSchema(schema, mock);
    return this;
  }

  public queueSchema<T = any>(
    schemaId: string,
    quantity: number = 1,
    overrides: IDictionary = {}
  ) {
    const d = new Deployment(this.db);
    d.queueSchema(schemaId, quantity, overrides);
    return d;
  }

  public generate() {
    const faker = getFakerLibrary();
    if (!faker && !faker.address) {
      throw new FixtureError(
        `The Faker library must be loaded before you can generate mocked data can be returned`,
        'firemock/faker-not-ready'
      );
    }

    return new Deployment(this.db).generate();
  }
}
