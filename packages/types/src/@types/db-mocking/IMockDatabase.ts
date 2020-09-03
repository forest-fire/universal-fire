import { IDictionary } from 'common-types';
import { IMockStore, INoAuth, IMockAuthMgmt } from '../../index';
import {
  IAdminAuth,
  IClientAuth,
  IClientRtdbDatabase,
  IFirestoreDatabase,
  IRtdbDatabase,
} from '../fire-proxies';
import { IAuthApi } from './other';

/**
 * This is the surface area returned by a Mock Database Factory (`IMockDbFactory`) and
 * provides all interaction points needed for a mock database.
 *
 * ```ts
 * import firemock from 'firemock';
 * const mockDb: IMockDatabase = firemock.connect(db);
 * ```
 *
 * > This contract will be honored by **Firemock** but any 3rd party library
 * can implement to this interface should they want to build a Firemock-_like_ library.
 */
export interface IMockDatabase {
  // /**
  //  * The SDK which this mock database will use to govern the
  //  * appropriate database and auth API's exposed by this mock database.
  //  */
  // sdk: SDK;

  // /**
  //  * The in-memory representation of _state_ in the mock database
  //  */
  // state: TState;

  /**
   * An API surface which allows direct synchronous changes to the database's state.
   * Typically this API is used for setting up the state to a desired state or possible
   * to report or debug on the state in tests.
   *
   * Consumers of the library should not typically go against this API and packages
   * like **Firemodel**, etc. will be unaware of this API.
   */
  store: IMockStore<IDictionary>;

  /**
   * This is the main API surface which mimics/mocks the interface exposed by a Firebase SDK.
   * This should be a drop-in replacement for any "real database" and therefore must
   * directly implement the appropriate Firebase type definition provided.
   */
  db: IFirestoreDatabase | IRtdbDatabase;

  /**
   * The main Auth API which will be tailored for the SDK you are using
   */
  auth: IClientAuth | IAdminAuth;
  /**
   * **authManager**
   *
   * Allows the AUTH state to be managed at runtime in a direct, non-firebase constrained way.
   *
   * **Note:** typically you would configure a starting state for AUTH when originating the mock
   * DB/Auth and then just allow the Auth's state to be changed by the Firebase-mocked auth API
   * provided by `IMockDatabase` but in some cases -- _such as maybe creating a Mock API during
   * testing that has access to admin-only features when connecting via client SDK_ -- you may
   * need to reach into operations which aren't available stricktly via the Firebase API.
   *
   * **Note:** hopefully for obvious reasons, consumers of this API should only use it for testing
   * use-cases as it _will not_ work with a real database!
   */
  authManager: IMockAuthMgmt;
}

export interface IClientRtdbMock extends IMockDatabase {
  auth: IClientAuth;
  db: IRtdbDatabase;
}
export interface IAdminRtdbMock extends IMockDatabase {
  auth: IAdminAuth;
  db: IRtdbDatabase;
}

export interface IClientFirestoreMock extends IMockDatabase {
  auth: IClientAuth;
  db: IFirestoreDatabase;
}
export interface IAdminFirestoreMock extends IMockDatabase {
  auth: IAdminAuth;
  db: IFirestoreDatabase;
}

// export type IMockDatabase =
//   | IClientRtdbMock
//   | IAdminRtdbMock
//   | IClientFirestoreMock
//   | IAdminFirestoreMock;
