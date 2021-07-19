import 'jest-extended';
import {
  IMockDatabase,
  SDK,
} from '@forest-fire/types';
import { createDatabase } from '~/databases/createDatabase';

describe('EmailAuthProvider =>', () => {
  let mock: IMockDatabase<SDK.RealTimeClient>;

  beforeAll(() => {
    mock = createDatabase(SDK.RealTimeClient);
  }

  it('EmailAuthProvider exists on client API', () => {
    const credential = mock.authManager.authProviders.EmailAuthProvider.credential;
    expect(credential).toBeFunction();
  });

  it('calling EmailAuthProvider.credential() gives back a valid AuthCredential', () => {
    const provider = mock.authManager.authProviders.EmailAuthProvider;
    const response = provider.credential(
      'me@somewhere.com',
      "i'm a little teacup"
    );
    expect(response).toBeInstanceOf(Object);
    expect(response.providerId).toBeString();
    expect(response.signInMethod).toBe('email-and-password');
    expect(response.toJSON).toBeFunction();
  });
});
