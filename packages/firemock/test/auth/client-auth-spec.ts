import 'jest-extended';
import { Mock } from '../../src/mocking/index';

import {
  addAuthObserver,
  authProviders,
  setCurrentUser,
  setDefaultAnonymousUid,
} from '../../src/auth/user-mgmt/index';

describe('Firebase Auth →', () => {
  it('Calling auth() gives you API', async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    expect(auth).toHaveProperty('signInAnonymously');
    expect(auth).toHaveProperty('signInWithEmailAndPassword');
    expect(auth).toHaveProperty('createUserWithEmailAndPassword');
  });

  it('Signing in anonymously is defaulted to true', async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    expect(authProviders().includes('anonymous')).toEqual(true);
  });

  it('Signing in with email is defaulted to false', async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    expect(authProviders().includes('emailPassword')).toEqual(false);
  });

  it('signInAnonymously returns uid of default anonymous user (when set)', async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    setDefaultAnonymousUid('1234');
    const user = await auth.signInAnonymously();

    expect(user.user.uid).toEqual('1234');
  });

  it('signInWithEmail with valid email returns a valid user', async () => {
    const m = await Mock.prepare({
      auth: {
        users: [
          { email: 'test@test.com', password: 'foobar', emailVerified: true },
        ],
        providers: ['emailPassword'],
      },
    });
    const auth = await m.auth();
    const user = await auth.signInWithEmailAndPassword(
      'test@test.com',
      'foobar'
    );
    expect(user.user.email).toBeString();
    expect(user.user.email).toEqual('test@test.com');
    expect(user.user.emailVerified).toEqual(true);
  });

  it('signInWithEmail with valid email but invalid password fails', async () => {
    const m = await Mock.prepare({
      auth: {
        users: [
          { email: 'test@test.com', password: 'foobar', emailVerified: true },
        ],
        providers: ['emailPassword'],
      },
    });
    const auth = await m.auth();
    try {
      const user = await auth.signInWithEmailAndPassword(
        'test@test.com',
        'bad-password'
      );
      throw new Error('Login attempt should have failed with error!');
    } catch (e) {
      expect(e.name).toEqual('auth/wrong-password');
      expect(e.code).toEqual('wrong-password');
    }
  });

  it('createUserWithEmailAndPassword created unverified user', async () => {
    const m = await Mock.prepare({
      auth: {
        providers: ['emailPassword'],
        users: [],
      },
    });
    const { userCredential } = await createUser(m, 'test@test.com', 'password');
    expect(userCredential.user.email).toEqual('test@test.com');
    expect(userCredential.user.emailVerified).toEqual(false);
  });

  it('once user is created, it can be used to login with', async () => {
    const m = await Mock.prepare({
      auth: {
        providers: ['emailPassword'],
        users: [],
      },
    });
    const { auth } = await createUser(m, 'test@test.com', 'password');
    const userCredentials = await auth.signInWithEmailAndPassword(
      'test@test.com',
      'password'
    );
    expect(userCredentials.user.email).toEqual('test@test.com');
  });

  it('userCredential passed back from creation allows password reset', async () => {
    const m = await Mock.prepare({
      auth: {
        providers: ['emailPassword'],
        users: [],
      },
    });
    const { userCredential, auth } = await createUser(
      m,
      'test@test.com',
      'password'
    );
    setCurrentUser(userCredential);
    expect(userCredential.user.updatePassword).toBeFunction();

    await userCredential.user.updatePassword('foobar');
    await auth.signInWithEmailAndPassword('test@test.com', 'foobar');
  });

  it('calls to getIdToken() respond with value configured when available', async () => {
    const expectedToken = '123456789';
    const m = await Mock.prepare({
      auth: {
        providers: ['emailPassword'],
        users: [
          {
            email: 'test@company.com',
            password: 'foobar',
            tokenIds: [expectedToken],
          },
        ],
      },
    });

    const auth = await m.auth();
    const user = await auth.signInWithEmailAndPassword(
      'test@company.com',
      'foobar'
    );
    const token = await user.user.getIdToken();

    expect(token).toEqual(expectedToken);
  });

  it('signInWithEmailAndPassword should notify authObservers', async () => {
    const user = { email: 'test@test.com', password: 'foobar' };
    const m = await Mock.prepare({
      auth: {
        providers: ['emailPassword'],
        users: [user],
      },
    });

    const auth = await m.auth();

    let hasBeenNotified = false;
    addAuthObserver(() => (hasBeenNotified = true));
    await auth.signInWithEmailAndPassword(user.email, user.password);

    expect(hasBeenNotified).toEqual(true);
  });

  it('signOut should notify authObservers', async () => {
    const user = { email: 'test@test.com', password: 'foobar' };
    const m = await Mock.prepare({
      auth: {
        providers: ['emailPassword'],
        users: [user],
      },
    });

    const auth = await m.auth();

    let hasBeenNotified = false;
    addAuthObserver(() => (hasBeenNotified = true));
    await auth.signOut();

    expect(hasBeenNotified).toEqual(true);
  });
});

async function createUser(mock: Mock, email: string, password: string) {
  const auth = await mock.auth();
  const userCredential = await auth.createUserWithEmailAndPassword(
    email,
    password
  );
  return { auth, userCredential };
}
