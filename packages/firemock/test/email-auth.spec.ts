import 'jest-extended';
import { IMockDatabase, SDK } from '@forest-fire/types';
import { createDatabase } from '~/databases/createDatabase';

describe('EmailAuthProvider =>', () => {
  let mock: IMockDatabase<SDK.RealTimeClient>;

  beforeAll(() => {
    mock = createDatabase(SDK.RealTimeClient);
  });

  it('EmailAuthProvider exists on client API', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { credential } = mock.authManager.authProviders.EmailAuthProvider;
    expect(typeof credential).toEqual('function');
  });

  it('calling EmailAuthProvider.credential() gives back a valid AuthCredential', () => {
    const provider = mock.authManager.authProviders.EmailAuthProvider;
    const response = provider.credential(
      'me@somewhere.com',
      "i'm a little teacup"
    );
    expect(typeof response === 'object').toBeTruthy();
    expect(typeof response.providerId).toEqual('string');
    expect(response.signInMethod).toBe('emailPassword');
    expect(typeof response.toJSON).toEqual('function');
  });
});
