import type {
  IClientAuth,
  AdditionalUserInfo,
  AuthCredential,
  User,
} from '@forest-fire/types';
import type { IDictionary } from 'common-types';

export type MockKlass = import('../mocking/Mock').Mock<any>;

/**
 * Create a user in the Auth system which can be logged in via the
 * email/password authentication style
 */
export interface IEmailUser {
  email: string;
  password: string;
  /** optionally state if the user should be considered email verified */
  verified?: boolean;
  /** optionally set a fixed UID for this user */
  uid?: string;
  /** optionally give the user a set of claims */
  claims?: IDictionary;
  /**
   * Optionally state token Ids which should be returned when calling
   * the `getTokenId()` method. This is useful if you have an associated
   * set of "valid (or invalid) tokens" in your testing environment.
   */
  tokenIds?: string[];
}

export type IMockSetup = (mock: MockKlass) => () => Promise<void>;

export interface IPartialUserCredential {
  additionalUserInfo?: Partial<AdditionalUserInfo>;
  credential?: Partial<AuthCredential> | null;
  operationType?: string | null;
  user?: Partial<User> | null;
}

/**
 * Provides a full FirebaseAuth implementation (although many
 * parts are un-implementated currently) as well as extending
 * to add an "administrative" API for mocking
 */
export interface IMockAuth extends IClientAuth {}

export type IAuthObserver = (user: User | null) => any;
