import { UserCredential } from '@firebase/auth-types';
import {
  IMockUserRecord,
  User,
  UserRecord,
  IMockAuthConfig,
  IMockUser,
  uid,
} from '../../index';
import { UpdateRequest } from '../fire-proxies';
import { AuthProviderName } from '../fire-types';
import { NetworkDelay } from './network';

export type IAuthObserver = (user: User | null) => any;

/**
 * **IMockAuthMgmt**
 *
 * An API surface exposed by a _mock_ Auth implementation to manage
 * the "state" of auth directly. This is intended to support
 * advanced testing use cases but is -- of course -- not portable
 * to be used in a "real database".
 */
export interface IMockAuthMgmt {
  /**
   * initializes the state of the mock Auth system to it's starting state
   */
  initializeAuth(config: IMockAuthConfig): void;

  /**
   * returns a list of active `IAuthObserver` registrations received
   * since the mock auth service was started.
   */
  getAuthObservers(): IAuthObserver[];
  /**
   * provide a callback which gets called any time the database transitions
   * to a new auth state.
   */
  addAuthObserver(ob: IAuthObserver): void;

  /**
   * Returns a boolean condition representing whether the passed in provider
   * has been configured for.
   */
  hasProvider(provider: AuthProviderName): boolean;

  /**
   * Adds a provider to the mock Auth service's list of supported services
   */
  addProvider(provider: AuthProviderName): void;
  /**
   * Removes a provider to the mock Auth service's list of supported services
   */
  removeProvider(provider: AuthProviderName): void;

  /**
   * **setCurrentUser**
   *
   * Sets who the current logged in user is and sends out notifications to
   * all Auth Observers.
   *
   * **Note:** this function is about identifying and changing the current user
   * to a new user, while you can pass in `User`, `UserCredential`, etc. to
   * identify the user it will not _update_ the user. Use `update()` for changes
   * to a user's profile if that's what you need.
   */
  setCurrentUser(
    user?: uid | User | UserCredential | IMockUser | IMockUserRecord
  ): IMockUserRecord;
  /**
   * **login**
   *
   * Configures the mock Auth state to have a new logged in user. If the user passed in
   * is _already_ logged in then this is a noop.
   */
  login(
    user?: string | User | UserCredential | IMockUser | IMockUserRecord
  ): User;
  /**
   * **logout**
   *
   * Logs out the currently logged in user in the mock Auth service
   */
  logout(): void;
  /**
   * returns the currently logged in user from the mock Auth service
   */
  getCurrentUser(): IMockUserRecord | undefined;

  /**
   * By default when a user logs in _anonymously_, they will be assigned
   * a random `uid` from the `getNewUid()` function on this API but
   * sometimes it is helpful to dictate what the `uid` should be. This function
   * provides you the ability to state what the next `uid` (or next array of `uid`s)
   * will be. If an anonymous user logs in and all of the explicit uid's have
   * been expired then the mock auth will return to generating random uid's.
   */
  queueAnonymousUidPool(uid: string | string[]): void;

  /**
   * Returns a `uid` from the "anonymous uid pool" if any exist but otherwise
   * return a random `uid` _string_ which is prefixed with `anonymous-user-`
   */
  getAnonymousUid(): string;

  /**
   * creates a random `uid` _string_
   */
  createNewUid(): string;

  /**
   * Allows users to be added to the "known users" pool at run time.
   *
   * @returns number the number of known users after adding the new user
   */
  addToUserPool(
    user: IMockUser | User | UserCredential | UserRecord | IMockUserRecord
  ): number;

  /**
   * Removes a user from "known users" users.
   */
  removeFromUserPool(
    user: uid | IMockUser | UserRecord | IMockUserRecord
  ): number;

  /**
   * Sets the network delay characteristics to be used for AUTH functions
   */
  setNetworkDelay(delay: NetworkDelay | number | [number, number]): void;

  /** produces a network delay based on configured settings for Auth service */
  networkDelay(): Promise<void>;

  /**
   * **findKnownUser**
   *
   * Returns the first known user who matches the name/value pair match
   * in the Auth user pool.
   *
   * For example:
   *
   * ```ts
   * const u: IMockUserRecord = findKnownUser('email', 'bob@company.com' })
   * ```
   */
  findKnownUser<K extends keyof IMockUserRecord>(
    prop: K,
    value: IMockUserRecord[K]
  ): IMockUserRecord | undefined;

  /**
   * Given a known user, allows a non-destructive means to update the user's
   * information. If a user with an unknown `uid` is passed in this function
   * will return an error with the **code** of "unknown-user".
   */
  updateUser(
    user: User | IMockUserRecord | string,
    changes: Partial<IMockUserRecord> | UpdateRequest
  ): void;

  /**
   * returns the list of known users that the mock Auth service is managing
   */
  knownUsers(): IMockUserRecord[];
}
