import { IMockUserRecord, UserRecord } from '@forest-fire/types';

export function toUserRecord(user: IMockUserRecord | undefined): UserRecord {
  if (!user) {
    return undefined;
  }
  const u = { ...user };
  delete u.password;
  delete u.providerId;
  return u;
}
