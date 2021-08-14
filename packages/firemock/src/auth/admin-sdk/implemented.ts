import { users, claims, tokens } from './implemented/index';
import type { AdminSdk, Auth, IMockAuthMgmt } from '@forest-fire/types';

export const implemented: (api: IMockAuthMgmt<AdminSdk>) => Partial<Auth> = (api) => ({
  ...users(api),
  ...claims(api),
  ...tokens(api),
});
