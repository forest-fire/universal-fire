import { ClientSdk, IMockAuthMgmt, User } from '@forest-fire/types';
import { validate } from 'email-validator';
import { uuid } from 'native-dash';

export const emailExistsAsUserInAuth =
  (api: IMockAuthMgmt<ClientSdk>) => (email: string) => {
    const emails = api.knownUsers().map((i) => i.email);

    return emails.includes(email);
  };

export const emailIsValidFormat =
  (_api: IMockAuthMgmt<ClientSdk>) => (email: string) => {
    return validate(email);
  };

export const emailHasCorrectPassword =
  (api: IMockAuthMgmt<ClientSdk>) => (email: string, password: string) => {
    const config = api.knownUsers().find((i) => i.email === email);

    return config ? config.password === password : false;
  };

export const emailVerified =
  (api: IMockAuthMgmt<ClientSdk>) => (email: string) => {
    const user = api.knownUsers().find((i) => i.email === email);
    return user ? user.emailVerified || false : false;
  };

export const userUid = (api: IMockAuthMgmt<ClientSdk>) => (email: string) => {
  const user = api.findKnownUser('email', email);

  return user ? user.uid : uuid();
};

export const emailValidationAllowed = (api: IMockAuthMgmt<ClientSdk>) => () => {
  return api.hasProvider('emailPassword');
};

export const loggedIn = (api: IMockAuthMgmt<ClientSdk>) => (user: User) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  api.getAuthObservers().map((o) => o(user));
};

export const loggedOut = (api: IMockAuthMgmt<ClientSdk>) => () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  api.getAuthObservers().map((o) => o(null));
};
