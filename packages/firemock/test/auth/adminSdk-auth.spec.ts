import { IDictionary } from 'common-types';
<<<<<<< HEAD:packages/firemock/test/auth/adminSdk-auth-spec.ts
import { Mock } from '../../src/mocking';
import { adminAuthSdk } from '../../src';
import { clearAuthUsers } from '../../src/auth/user-mgmt';
import 'jest-extended';
import { AuthProviderName } from '@forest-fire/types';
=======
import { createDatabase } from '../../src';
import { AuthProviderName, SDK } from '~/auth/admin-sdk';
>>>>>>> feature/refresh_ext:packages/firemock/test/auth/adminSdk-auth.spec.ts

describe('Admin Auth => ', () => {
  it('using a direct import, primary functions are in place', async () => {
    const m = createDatabase(SDK.RealTimeAdmin);

    hasExpectedFunctions(m.auth);
  });

  it('returned UserRecord has correct props when calling createUser', async () => {
    const m = createDatabase(SDK.RealTimeAdmin);
    const admin = m.auth;
    const response = await admin.createUser({
      email: 'test@test.com',
      disabled: false,
      displayName: 'John Smith',
      emailVerified: true,
      uid: '1234',
      password: 'foobar',
    });
    // UserRecord has correct props
    expect(typeof response).toEqual("object");
    expect(response.uid).toBe('1234');
    expect(response.email).toBe('test@test.com');
    expect(response.displayName).toBe('John Smith');
    expect(response.disabled).toBe(false);
  });

<<<<<<< HEAD:packages/firemock/test/auth/adminSdk-auth-spec.ts
  it('creating a User allows the client API to use that user to login', async () => {
    const m = await Mock.prepare({
      auth: { providers: [AuthProviderName.emailPassword] },
    });
    const auth = await m.auth();
    const admin = adminAuthSdk;
    await admin.createUser({
      email: 'test@test.com',
      disabled: false,
      displayName: 'John Smith',
      emailVerified: true,
      uid: '1234',
      password: 'foobar',
    });
=======
  // TODO: Since now we are not using a global state for users, creating in-memory client and admin instances, they will hold their own state. This test does not make sense anymore  
  it.skip('creating a User allows the client API to use that user to login', async () => {
    const m = createDatabase(SDK.RealTimeClient,{ auth: { providers: [AuthProviderName.emailPassword] } });
    const auth = m.auth;
    // const admin = createAdminAuth(m.authManager);
    // await admin.createUser({
    //   email: 'test@test.com',
    //   disabled: false,
    //   displayName: 'John Smith',
    //   emailVerified: true,
    //   uid: '1234',
    //   password: 'foobar',
    // });
>>>>>>> feature/refresh_ext:packages/firemock/test/auth/adminSdk-auth.spec.ts

    const response = await auth.signInWithEmailAndPassword(
      'test@test.com',
      'foobar'
    );
    expect(response.user.uid).toBe('1234');
    expect(response.user.email).toBe('test@test.com');
    expect(response.user.emailVerified).toBe(true);
    expect(response.user.displayName).toBe('John Smith');
    expect(response.user.providerId);
  });

  it('using admin API ... can create, update, then delete two users; listing at every step', async () => {
    const m = createDatabase(SDK.RealTimeAdmin, {
      auth: { providers: [AuthProviderName.emailPassword] },
    });

    const admin = m.auth;
    await admin.createUser({
      email: 'john@test.com',
      displayName: 'John Smith',
      uid: '1234',
      password: 'foobar',
    });
    await admin.createUser({
      email: 'jane@test.com',
      displayName: 'Jane Doe',
      uid: '4567',
      password: 'foobar',
    });
    let users = await admin.listUsers();
    expect(users.hasOwnProperty('users')).toBeTruthy();
    expect(Array.isArray(users.users)).toBeTruthy();
    expect(users.users).toHaveLength(2);

    let found = users.users.find((u) => u.uid === '1234');
    expect(found).toBeDefined();
    expect(found.emailVerified).toBe(false);

    // update
    await admin.updateUser('1234', {
      emailVerified: true,
    });
    users = await admin.listUsers();
    found = users.users.find((u) => u.uid === '1234');
    expect(found.emailVerified).toBe(true);

    // // remove one
    // await admin.deleteUser('4567');
    // users = await admin.listUsers();
    // expect(users.users).toHaveLength(1);

    // // remove remaining
    // await admin.deleteUser('1234');
    // users = await admin.listUsers();
    // expect(users.users).toHaveLength(0);
  });
});

export function hasExpectedFunctions(api: IDictionary) {
  expect(api).toHaveProperty('createUser');
  expect(api).toHaveProperty('updateUser');
  expect(api).toHaveProperty('deleteUser');
  expect(api).toHaveProperty('getUserByEmail');
  expect(api).toHaveProperty('listUsers');
}
