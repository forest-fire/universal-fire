import type { IMockAuthMgmt, User } from '@forest-fire/types';
import { validate } from 'email-validator';
import { allUsers, authProviders, getAuthObservers } from '@/auth/util/index';

export const emailExistsAsUserInAuth = (api: IMockAuthMgmt) => (
  email: string
) => {
  const emails = allUsers().map((i) => i.email);

  return emails.includes(email);
};

export const emailIsValidFormat = (api: IMockAuthMgmt) => (email: string) => {
  return validate(email);
};

export const emailHasCorrectPassword = (email: string, password: string) => {
  const config = allUsers().find((i) => i.email === email);

  return config ? config.password === password : false;
};

export const emailVerified = (api: IMockAuthMgmt) => (email: string) => {
  const user = allUsers().find((i) => i.email === email);
  return user ? user.emailVerified || false : false;
};

export const userUid = (api: IMockAuthMgmt) => (email: string) => {
  const user = api.findKnownUser('email', email);

  return user ? user.uid : api.getAnonymousUid();
};

export const emailValidationAllowed = (api: IMockAuthMgmt) => () => {
  return authProviders().includes('emailPassword');
};

export const loggedIn = (api: IMockAuthMgmt) => (user: User) => {
  getAuthObservers().map((o) => o(user));
};

export const loggedOut = (api: IMockAuthMgmt) => () => {
  getAuthObservers().map((o) => o(null));
};
