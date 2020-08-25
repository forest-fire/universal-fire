import { IDictionary } from 'common-types';
import {
  IAbstractedDatabase,
  IDatabaseGenericApi,
} from './abstracted-database';
import { IAdminAuth, IClientAuth } from './fire-proxies';
import {
  IDatabaseConfig,
  IMockAuthConfig,
  IMockConfig,
  IMockData,
} from './fire-types';

/**
 * The expected administrative interface for any package which will provide a _mocked_
 * database.
 *
 * This contract will be honored by **Firemock** but any 3rd party library
 * can implement to this interface should they want to build a Firemock-_like_ library.
 */
export interface IMockDbAdmin<
  TState extends IDictionary = IDictionary,
  TAuth = IClientAuth | IAdminAuth | INoAuth
> extends IDatabaseGenericApi {
  /**
   * The in-memory representation of _state_ in the mock database
   */
  state: TState;
  /**
   * The database's API surface users will use in precisely the same way they would with
   * a _real_ database.
   */
  db: IDatabaseGenericApi;

  /**
   * Provides either the _client_ or _admin_ Auth API exposed by Firebase.
   *
   * Note: because an implementor is _not_ required to address AUTH they can instead
   * return the `INoAuth` interface to indicate that this is not available.
   */
  auth: TAuth;
}

export interface INoAuth {
  kind: 'mock-db-without-auth';
}

/**
 * Detects whether the given Mock Admin includes "auth" functionality
 * and narrows the type accordingly.
 */
export function hasAuthMock(
  mock: IMockDbAdmin
): mock is IMockDbAdmin<IClientAuth | IAdminAuth> {
  return (mock as any).kind === 'mock-db-without-auth' ? false : true;
}

/**
 * **IMockDbFactory**
 *
 * Provides a factory object which allows the synchronous _creation_ of a mock database, or
 * the asynchronous _connection_ to a mock database.
 */
export interface IMockDdFactory {
  /**
   * **create**
   *
   * Creates a mock database but does not "connect" to it yet.
   */
  create: (
    db: IDatabaseConfig,
    mockData?: IMockData,
    mockAuth?: IMockAuthConfig
  ) => IMockDbAdmin;
  /**
   * **connect**
   *
   * Creates a mock database and then asynchronously _connects_ to the database.
   *
   * **Note:** "connecting" may only involve introducing a small delay to similate
   * the connection process, though in other cases there might actually be a true
   * connection to be made (for instance in async loading the data and/or auth
   * configuration).
   */
  connect: (
    db: IDatabaseConfig,
    mockData?: IMockData,
    mockAuth?: IMockAuthConfig
  ) => Promise<IMockDbAdmin>;
}
