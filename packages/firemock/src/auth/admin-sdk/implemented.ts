import { users, claims, tokens } from './implemented/index';
import type { Auth, IMockAuthMgmt } from '@forest-fire/types';

export const implemented: (api: IMockAuthMgmt) => Partial<Auth> = (api) => ({
  ...users(api),
  ...claims(api),
  ...tokens(api),
});
