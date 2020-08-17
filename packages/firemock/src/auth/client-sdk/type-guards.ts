import {
  IMockUser,
  IMockUserRecord,
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
 */
export function isMockUserRecord(
  u: UserCredential | User | UserRecord | IMockUser
): u is IMockUserRecord {
  const check = (u as unknown) as IDictionary;
  return check.kind && check.kind === 'MockUserRecord';
}

/**
 * Boolean flag and type guard that checks whether this is Admin SDK's `UserRecord`.
 *
 * Note: the `IMockUser` is a superset of this.
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
/**
 * Boolean flat to detect if user-like object is a `User` from the client SDK
 */
export function isUser(
  user: UserCredential | User | UserRecord | IMockUser
): user is User {
  return !isMockUserRecord(user) &&
    !isUserRecord(user) &&
    (user as User).uid !== undefined
    ? true
    : false;
}
