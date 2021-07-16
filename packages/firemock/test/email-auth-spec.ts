import 'jest-extended';
import {
  IDatabaseSdk,
  SDK,
  IMockStore,
  IMockData,
  IMockDatabase,
} from '@forest-fire/types';
import {RealTimeClient} from "@forest-fire/real-time-client"
import { firemock } from '../src';

describe('EmailAuthProvider =>', () => {
  let mockingDatabase: IDatabaseSdk<SDK.RealTimeClient>;

  beforeAll(async () => {
    mockingDatabase =  await RealTimeClient.connect(
      { mocking: true } 
    );
  });

  it('EmailAuthProvider exists and has appropriate props', async () => {
    expect(mockingDatabase.).toBeInstanceOf(Object);
    expect(mockingDatabase.authManager.authProviders.EmailAuthProvider.credential).toBeFunction();
  });

  it('calling credential() gives back a valid AuthCredential', () => {
    const m = new Mock();
    const provider = m.authProviders.EmailAuthProvider;
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
