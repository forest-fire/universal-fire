import type {
  IMockUserRecord,
  IMockAuthConfig,
  IAuthProviderName,
  IMockUser,
  UpdateRequest,
  UserCredential,
  User,
  UserRecord,
} from '@forest-fire/types';
import { IDictionary, pk } from 'common-types';
import { FireMockError } from '@/errors/FireMockError';
import { clientApiUser } from '@/auth/client-sdk/UserObject';
import { IAuthObserver } from '@/@types';
import {
  isMockUserRecord,
  isUserCredential,
  isUserRecord,
  isUser,
} from '../client-sdk/type-guards';

/**
 * The recognized users in the mock Auth system
 */
let _users: IMockUserRecord[] = [];

/**
 * The `uid` of the user which is currently logged in.
 *
 * > **Note:** this only applies to client-sdk usages
 */
let _currentUser: pk;

/** the full `UserCredential` object for the current user */
let _currentUserCredential: UserCredential;

/**
 * callbacks sent in for callback when the
 * _auth_ state changes.
 */
let _authObservers: IAuthObserver[] = [];

/**
 * The _providers_ which have been enabled
 * for this mock Auth API
 */
let _providers: IAuthProviderName[] = [];

export function getAuthObservers() {
  return _authObservers;
}

export function addAuthObserver(ob: IAuthObserver) {
  _authObservers.push(ob);
}

export function initializeAuth(config: IMockAuthConfig) {
  const baseUser: () => Partial<IMockUserRecord> = () => ({
    emailVerified: false,
    uid: getRandomMockUid(),
    providerData: [],
  });
  _users =
    (config.users || []).map(
      (u) => ({ ...baseUser(), ...u } as IMockUserRecord)
    ) || [];
  _providers = config.providers || [];
}

/** sets the current user based on a given `UserCredential` */
export function setCurrentUser(user: User | UserCredential) {
  if (isUser(user)) {
    _currentUser = user.uid;
    _currentUserCredential = {
      user,
      additionalUserInfo: {
        isNewUser: false,
        profile: {},
        providerId: 'mock',
        username: user.email,
      },
      credential: {
        signInMethod: 'mock',
        providerId: 'mock',
        toJSON: () => user,
      },
    };
  } else {
    _currentUser = user.user.uid;
    _currentUserCredential = user;
  }
  // It should notify all auth observers on `setCurrentUser` call method
  getAuthObservers().map((o) => o(_currentUserCredential.user));
}

/**
 * Returns the `IMockUserRecord` record for the currently logged in user
 */
export function currentUser() {
  return _currentUser ? _users.find((u) => u.uid === _currentUser) : undefined;
}

/**
 * Returns the full `UserCredential` object for the logged in user;
 * this is only relevant for client sdk.
 */
export function currentUserCredential(): UserCredential {
  return _currentUserCredential;
}

/**
 * Clears the `currentUser` and `currentUserCredential` as would be
 * typical of what happens at the point a user is logged out.
 */
export function clearCurrentUser() {
  _currentUser = undefined;
  _currentUserCredential = undefined;
  // It should notify all auth observers on `clearCurrentUser` call method
  getAuthObservers().map((o) => o(undefined));
}

/**
 * Clears all known mock users
 */
export function clearAuthUsers() {
  _users = [];
}

/**
 * The _default_ **uid** to assigne to anonymous users
 */
let _defaultAnonymousUid: string;

export function setDefaultAnonymousUid(uid: string) {
  _defaultAnonymousUid = uid;
}

export function getAnonymousUid() {
  return _defaultAnonymousUid ? _defaultAnonymousUid : getRandomMockUid();
}

/**
 * Adds a "known user" to the user pool that Firemock is managing
 *
 * @param user either a `IMockUser` or the client SDK's `User` definition
 */
export function addToUserPool(
  user: IMockUser | User | UserCredential | UserRecord | IMockUserRecord
) {
  let mockUser: IMockUserRecord;

  // for those that need fake data:
  const metadata: UserRecord['metadata'] = {
    lastSignInTime: undefined,
    creationTime: new Date().toUTCString(),
    toJSON: () => ({}),
  };

  // you typically wouldn't add from a `UserCredential` but you can
  if (isMockUserRecord(user)) {
    mockUser = user;
  } else if (isUserRecord(user)) {
    mockUser = {
      ...user,
      kind: 'MockUserRecord',
    };
  } else if (isUserCredential(user)) {
    mockUser = {
      kind: 'MockUserRecord',
      uid: user.user.uid,
      emailVerified: user.user.emailVerified,
      disabled: false,
      claims: {},
      phoneNumber: user.user.phoneNumber,
      isAnonymous: user.user.isAnonymous,
      photoURL: user.user.photoURL,
      tokenIds: [],
      metadata,
      providerData: undefined,
      toJSON: () => ({}),
    };
  } else if (isUser(user)) {
    mockUser = {
      kind: 'MockUserRecord',
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      disabled: false,
      customClaims: {},
      claims: {},
      password: (user as IDictionary).password as string | 'abcdefg',
      metadata,
      providerData: undefined,
      toJSON: () => ({}),
    };
  }

  const defaultUser: Partial<IMockUserRecord> = {
    uid: getRandomMockUid(),
    disabled: false,
    emailVerified: false,
  };
  const fullUser = { ...defaultUser, ...user } as IMockUserRecord;
  if (_users.find((u) => u.uid === fullUser.uid)) {
    throw new FireMockError(
      `Attempt to add user with UID of "${fullUser.uid}" failed as the user already exists!`
    );
  }

  _users = _users.concat(fullUser);
}

export function getUserById(uid: string) {
  return _users.find((u) => u.uid === uid);
}

export function getUserByEmail(email: string) {
  return _users.find((u) => u.email === email);
}

/**
 * Find a "known user" that has been configured for the Mock
 * Auth system.
 *
 * ```ts
 * const u: IMockUserRecord = findKnownUser('email', 'bob@company.com' })
 * ```
 */
export function findKnownUser<K extends keyof IMockUserRecord>(
  prop: K,
  value: IMockUserRecord[K]
) {
  return _users.find((u) => u[prop] === value);
}

/**
 * Converts the basic properties provided by a
 * `IMockUserRecord` definition into a full fledged `User` object
 * which is a superset including methods such as `updateEmail`,
 * `updatePassword`, etc. For more info refer to docs on `User`:
 *
 * [User Docs](https://firebase.google.com/docs/reference/js/firebase.User)
 *
 * @param user a mock user defined by `IMockUserRecord`
 */
export function convertToFirebaseUser(user: IMockUserRecord): User {
  return {
    ...user,
    ...clientApiUser,
  } as User;
}

export function updateUser(
  uid: string,
  update: Partial<IMockUserRecord> | UpdateRequest
) {
  const existing = _users.find((u) => u.uid === uid);
  if (!existing) {
    throw new FireMockError(
      `Attempt to update the user with UID of "${uid}" failed because this user is not defined in the mock Auth instance!`
    );
  }
  _users = _users.map((u) =>
    u.uid === uid ? ({ ...u, ...update } as IMockUserRecord) : u
  );
}

export function allUsers() {
  return _users;
}

export function removeUser(uid: string) {
  if (!_users.find((u) => u.uid === uid)) {
    throw new FireMockError(
      `Attempt to remove the user with UID of "${uid}" failed because this user was NOT in the mock Auth instance!`
    );
  }
  _users = _users.filter((u) => u.uid !== uid);
}

export function authProviders() {
  return _providers;
}

export function getRandomMockUid() {
  return `mock-uid-${Math.random().toString(36).substr(2, 10)}`;
}
