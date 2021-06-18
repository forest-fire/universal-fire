import { AuthProviderName, IMockAuthMgmt, User } from '@forest-fire/types';
import { validate } from 'email-validator';

export const emailExistsAsUserInAuth =
  (api: IMockAuthMgmt) => (email: string) => {
    const emails = api.knownUsers().map((i) => i.email);

    return emails.includes(email);
  };

export const emailIsValidFormat = (api: IMockAuthMgmt) => (email: string) => {
  return validate(email);
};

export const emailHasCorrectPassword =
  (api: IMockAuthMgmt) => (email: string, password: string) => {
    const config = api.knownUsers().find((i) => i.email === email);

    return config ? config.password === password : false;
  };

export const emailVerified = (api: IMockAuthMgmt) => (email: string) => {
  const user = api.knownUsers().find((i) => i.email === email);
  return user ? user.emailVerified || false : false;
};

export const userUid = (api: IMockAuthMgmt) => (email: string) => {
  const user = api.findKnownUser('email', email);

  return user ? user.uid : api.getAnonymousUid();
};

export const emailValidationAllowed = (api: IMockAuthMgmt) => () => {
  return api.hasProvider(AuthProviderName.emailPassword);
};

export const loggedIn = (api: IMockAuthMgmt) => (user: User) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  api.getAuthObservers().map((o) => o(user));
};

export const loggedOut = (api: IMockAuthMgmt) => () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  api.getAuthObservers().map((o) => o(null));
};
