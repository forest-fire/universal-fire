import {
  IMockUser,
  User,
  UserCredential,
  UserRecord,
} from '@forest-fire/types';
import { IDictionary } from 'common-types';

export function isUserCredential(
  u: UserCredential | User | UserRecord | IMockUser
): u is UserCredential {
  const check = (u as unknown) as IDictionary;
  return check.user && check.credential && check.additionalUserInfo
    ? true
    : false;
}

/**
 * Boolean flag and type guard that checks whether this is Firemock `IMock` user
 * definition.
 *
 * @param u
 */
export function isMockUser(
  u: UserCredential | User | UserRecord | IMockUser
): u is IMockUser {
  const check = (u as unknown) as IDictionary;
  return check.kind && check.kind === 'MockUser';
}

/**
 * Boolean flag and type guard that checks whether this is Admin SDK's `UserRecord`.
 *
 * Note: the `IMockUser` is a superset of this.
 *
 * @param u
 */
export function isUserRecord(
  u: UserCredential | User | UserRecord | IMockUser
): u is UserRecord {
  const check = (u as unknown) as IDictionary;
  return (
    check.metadata &&
    check.providerData &&
    check.emailVerified !== undefined &&
    check.kind === undefined
  );
}
