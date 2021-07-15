import { FireMockError } from "../errors";
import {
  IMockAuthMgmt,
  IMockUser,
  IMockUserRecord,
  User,
  UserCredential,
  UserRecord,
  AuthProviderName,
  IMockAuthConfig,
  UpdateRequest,
  IAuthObserver,
  NetworkDelay,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';
import {
  isMockUserRecord,
  isUser,
  isUserCredential,
  isUserRecord,
} from './type-guards/index';
import { toUser } from './util';
import { networkDelay as delay } from '../util';

export function createAuthManager(): IMockAuthMgmt {
  const _anonymousUidQueue: string[] = [];
  let _providers: AuthProviderName[];
  const _authObservers: IAuthObserver[] = [];
  let _currentUser: string | null = null;
  let _knownUsers: IMockUserRecord[] = [];
  let _networkDelay: NetworkDelay | number | [number, number];

  const getAuthObservers = () => {
    return _authObservers;
  };

  const addAuthObserver = (ob: IAuthObserver) => {
    _authObservers.push(ob);
  };

  const hasProvider = (provider: AuthProviderName) => {
    return _providers.includes(provider);
  };

  const addProvider = (provider: AuthProviderName) => {
    if (_providers.includes(provider)) {
      throw new FireMockError(
        `Failed adding "${provider}" as a new Firemock auth provider as it was already listed as a provider!`,
        'already-exists'
      );
    }
    _providers.push(provider);
  };

  const removeProvider = (provider: AuthProviderName) => {
    if (!_providers.includes(provider)) {
      throw new FireMockError(
        `Failed to remove "${provider}" as a Firemock auth provider as it was not listed as a provider!`,
        'does-not-exists'
      );
    }
    _providers = _providers.filter((i) => i !== provider);
  };

  const findKnownUser = <K extends keyof IMockUserRecord>(
    prop: K,
    value: IMockUserRecord[K]
  ) => {
    return _knownUsers.find((u) => u[prop] === value);
  };

  const getCurrentUser = () => {
    return _currentUser ? findKnownUser('uid', _currentUser) : undefined;
  };

  const setCurrentUser = (
    user?: string | User | UserCredential | IMockUser
  ): IMockUserRecord => {
    let lookingFor: string;
    if (typeof user === 'string') {
      lookingFor = user;
    } else if (isUser(user) || isMockUserRecord(user)) {
      lookingFor = user.uid;
    } else if (isUserCredential(user)) {
      lookingFor = user.user.uid;
    }

    const u = findKnownUser('uid', lookingFor);
    const uid = u ? u.uid : undefined;

    if (!uid) {
      throw new FireMockError(
        `Attempt to set current user failed as UID [${lookingFor}] could not be found in the known users being managed by the Auth service!`,
        'user-missing'
      );
    }

    if (_currentUser !== uid) {
      _currentUser = uid;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      getAuthObservers().map((o) => o(toUser(getCurrentUser())));
    }

    return u;
  };

  const login = (user: string | User | UserCredential): User => {
    if (!user) {
      throw new FireMockError(
        `Attempt to login without passing a valid user representation!`,
        'not-allowed'
      );
    }
    return toUser(setCurrentUser(user));
  };

  const logout = () => {
    if (_providers) {
      if (_providers.includes(AuthProviderName.anonymous)) {
        setCurrentUser(getAnonymousUid());
      } else {
        setCurrentUser();
      }
    }
  };

  const createNewUid = () => {
    return `${Math.random().toString(36).substr(2, 10)}`;
  };

  const getAnonymousUid = () => {
    if (_anonymousUidQueue.length > 0) {
      const uid = _anonymousUidQueue.shift();
      return uid;
    } else {
      return `anonymous-user-${createNewUid()}`;
    }
  };

  const addToUserPool = (
    user: IMockUser | User | UserCredential | UserRecord | IMockUserRecord
  ) => {
    let mockUser: IMockUserRecord;

    // for those that need fake data:
    const metadata: UserRecord['metadata'] = {
      lastSignInTime: undefined,
      creationTime: new Date().toUTCString(),
      toJSON: () => ({}),
    };

    if (isMockUserRecord(user)) {
      mockUser = user;
    } else if (isUserRecord(user)) {
      mockUser = {
        password: '123456789',
        ...user,
        kind: 'MockUserRecord',
      };
    } else if (isUserCredential(user)) {
      mockUser = {
        kind: 'MockUserRecord',
        uid: user.user.uid,
        emailVerified: user.user.emailVerified,
        disabled: false,
        customClaims: {},
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
        password: (user as IDictionary).password as string | '123456789',
        metadata,
        providerData: undefined,
        toJSON: () => ({}),
      };
    }

    _knownUsers.push(mockUser);

    return _knownUsers.length;
  };

  const removeFromUserPool = (uid: string) => {
    _knownUsers = _knownUsers.filter((i) => i.uid !== uid);
    return _knownUsers.length;
  };

  const knownUsers = () => {
    return _knownUsers;
  };

  const initializeAuth = async (config: IMockAuthConfig): Promise<void> => {
    _providers =
      typeof config.providers === 'function'
        ? await config.providers()
        : config.providers;

    const users =
      typeof config.users === 'function' ? await config.users() : config.users;
    _knownUsers = [];
    users?.forEach((u) => {
      addToUserPool(u);
    });
  };

  const updateUser = (
    user: IMockUserRecord | string,
    updates: Partial<IMockUserRecord> | UpdateRequest
  ) => {
    let u: IMockUserRecord;
    if (!isMockUserRecord(updates)) {
      updates = {
        ...(updates.disabled !== undefined
          ? { disabled: updates.disabled }
          : {}),
        ...(updates.displayName !== undefined
          ? { displayName: updates.displayName }
          : {}),
        ...(updates.email !== undefined ? { email: updates.email } : {}),
        ...(updates.emailVerified !== undefined
          ? { emailVerified: updates.emailVerified }
          : {}),
        ...(updates.password !== undefined
          ? { password: updates.password }
          : {}),
        ...(updates.photoURL !== undefined
          ? { photoURL: updates.photoURL }
          : {}),
        ...(updates.multiFactor !== undefined
          ? { clientMultiFactor: updates.multiFactor }
          : {}),
      } as Partial<IMockUserRecord>;
    }

    if (typeof user === 'string') {
      const u = findKnownUser('uid', user);
      if (!u) {
        throw new FireMockError(
          `Attempt to update the user with UID of "${user}" failed because this user is not defined in the mock Auth instance!`
        );
      }
    } else {
      u = user;
    }
    _knownUsers = _knownUsers.map((i) =>
      i.uid === u.uid ? { ...i, ...(updates as IMockUserRecord) } : i
    );
  };

  const queueAnonymousUidPool = () => {
    //
  };

  const networkDelay = async () => {
    await delay(_networkDelay);
  };

  const setNetworkDelay = (delay: NetworkDelay | number | [number, number]) => {
    _networkDelay = delay;
  };

  return {
    getAuthObservers,
    addAuthObserver,
    getCurrentUser,
    setCurrentUser,
    login,
    logout,
    createNewUid,
    getAnonymousUid,
    findKnownUser,
    hasProvider,
    updateUser,
    addToUserPool,
    knownUsers,
    initializeAuth,
    queueAnonymousUidPool,
    addProvider,
    removeProvider,
    networkDelay,
    removeFromUserPool,
    setNetworkDelay,
  };
}
