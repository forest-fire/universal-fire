import { createDatabase } from '~/databases';
import { SDK } from '~/auth/admin-sdk';
import { createAuth } from '~/auth';
import { IClientAuth } from '@forest-fire/types';

describe('Firebase Auth →', () => {
  it('Calling auth() gives you API', async () => {
    const m = createDatabase('RealTimeClient');
    expect(m.auth).toHaveProperty('signInAnonymously');
    expect(m.auth).toHaveProperty('signInWithEmailAndPassword');
    expect(m.auth).toHaveProperty('createUserWithEmailAndPassword');
  });

  it('Signing in anonymously is defaulted to true', async () => {
    const m = createDatabase('RealTimeClient');

    expect(m.authManager.getAuthProvidersNames().includes('anonymous')).toEqual(
      true
    );
  });

  it('Signing in with email is defaulted to false', async () => {
    const m = createDatabase(SDK.RealTimeClient);
    expect(
      Object.keys(m.authManager.getAuthProvidersNames()).includes(
        'emailPassword'
      )
    ).toEqual(false);
  });

  it('signInAnonymously returns uid of default anonymous user (when set)', async () => {
    const m = createDatabase('RealTimeClient');

    const user = await m.auth.signInAnonymously();

    expect(user.user.uid).toBeDefined();
    expect(user.user.isAnonymous).toEqual(true);
    expect(typeof user.user.uid).toEqual('string');
  });

  it('signInWithEmail with valid email returns a valid user', async () => {
    const m = createDatabase(SDK.RealTimeClient, {
      auth: {
        users: [
          { email: 'test@test.com', password: 'foobar', emailVerified: true },
        ],
        providers: ['emailPassword'],
      },
    });
    const auth = m.auth;
    const user = await auth.signInWithEmailAndPassword(
      'test@test.com',
      'foobar'
    );

    expect(typeof user.user.email).toEqual('string');
    expect(user.user.email).toEqual('test@test.com');
    expect(user.user.emailVerified).toEqual(true);
  });

  it(`signInWithEmail when user's configuration is passed in asynchronously`, async () => {
    const m = createDatabase(SDK.RealTimeClient, {
      auth: {
        users: () =>
          Promise.resolve([
            { email: 'test@test.com', password: 'foobar', emailVerified: true },
          ]),
        providers: ['emailPassword'],
      },
    });
    const auth = m.auth;
    const user = await auth.signInWithEmailAndPassword(
      'test@test.com',
      'foobar'
    );
    expect(typeof user.user.email).toEqual('string');
    expect(user.user.email).toEqual('test@test.com');
    expect(user.user.emailVerified).toEqual(true);
  });

  it('signInWithEmail with valid email but invalid password fails', async () => {
    const m = createDatabase(SDK.RealTimeClient, {
      auth: {
        users: [
          { email: 'test@test.com', password: 'foobar', emailVerified: true },
        ],
        providers: ['emailPassword'],
      },
    });
    const auth = m.auth;
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
    const m = createDatabase(SDK.RealTimeClient, {
      auth: {
        providers: ['emailPassword'],
        users: [],
      },
    });
    const { userCredential } = await createUser(
      m.auth,
      'test@test.com',
      'password'
    );
    expect(userCredential.user.email).toEqual('test@test.com');
    expect(userCredential.user.emailVerified).toEqual(false);
  });

  it('once user is created, it can be used to login with', async () => {
    const m = createDatabase(SDK.RealTimeClient, {
      auth: {
        providers: ['emailPassword'],
        users: [],
      },
    });
    const { auth } = await createUser(m.auth, 'test@test.com', 'password');
    const userCredentials = await auth.signInWithEmailAndPassword(
      'test@test.com',
      'password'
    );
    expect(userCredentials.user.email).toEqual('test@test.com');
  });

  it('userCredential passed back from creation allows password reset', async () => {
    const m = createDatabase(SDK.RealTimeClient, {
      auth: {
        providers: ['emailPassword'],
        users: [],
      },
    });
    const { userCredential, auth } = await createUser(
      m.auth,
      'test@test.com',
      'password'
    );
    m.authManager.setCurrentUser(userCredential);

    expect(typeof userCredential.user.updatePassword).toEqual('function');

    await userCredential.user.updatePassword('foobar');
    await auth.signInWithEmailAndPassword('test@test.com', 'foobar');
  });

  it('calls to getIdToken() respond with value configured when available', async () => {
    const expectedToken = '123456789';
    const m = createDatabase(SDK.RealTimeClient, {
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

    const auth = m.auth;
    const user = await auth.signInWithEmailAndPassword(
      'test@company.com',
      'foobar'
    );
    const token = await user.user.getIdToken();

    expect(token).toEqual(expectedToken);
  });

  it('signInWithEmailAndPassword should notify authObservers', async () => {
    const user = { email: 'test@test.com', password: 'foobar' };
    const m = createDatabase(SDK.RealTimeClient, {
      auth: {
        providers: ['emailPassword'],
        users: [user],
      },
    });

    const auth = m.auth;

    let hasBeenNotified = false;
    m.authManager.addAuthObserver(() => (hasBeenNotified = true));
    await auth.signInWithEmailAndPassword(user.email, user.password);

    expect(hasBeenNotified).toEqual(true);
  });

  it('signOut should notify authObservers', async () => {
    const user = { email: 'test@test.com', password: 'foobar' };
    const m = createDatabase(SDK.RealTimeClient, {
      auth: {
        providers: ['emailPassword'],
        users: [user],
      },
    });

    const auth = m.auth;
    let hasBeenNotified = false;
    m.authManager.addAuthObserver(() => (hasBeenNotified = true));
    await auth.signOut();

    expect(hasBeenNotified).toEqual(true);
  });
});

async function createUser(auth: IClientAuth, email: string, password: string) {
  const userCredential = await auth.createUserWithEmailAndPassword(
    email,
    password
  );
  return { auth, userCredential };
}
