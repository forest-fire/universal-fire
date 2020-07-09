import { users, claims, tokens } from './implemented/index';
import type { Auth } from '@forest-fire/types';

export const implemented: Partial<Auth> = {
  ...users,
  ...claims,
  ...tokens,
};
