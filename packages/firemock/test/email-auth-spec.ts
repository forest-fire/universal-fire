import { Mock } from '../src';

describe('EmailAuthProvider =>', () => {
  it('EmailAuthProvider exists and has appropriate props', async () => {
    const m = new Mock();
    expect(m.authProviders).toBeInstanceOf(Object);
    expect(m.authProviders.EmailAuthProvider.credential).toBeFunction();
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
