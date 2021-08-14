import type {
  Auth,
  CreateRequest,
  UserRecord,
  UpdateRequest,
  ListUsersResult,
  IMockAuthMgmt,
  User,
  IMockUserRecord,
  uid,
  AdminSdk,
} from '@forest-fire/types';
import {
  addToUserPool,
  updateUser,
  getUserById,
  removeUser,
  getUserByEmail,
  allUsers,
} from '~/auth/user-mgmt';
import { networkDelay } from '~/util';

export const users: (api: IMockAuthMgmt<AdminSdk>) => Partial<Auth> = (
  api
) => ({
  // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
  // eslint-disable-next-line @typescript-eslint/require-await
  async createUser(properties: CreateRequest): Promise<UserRecord> {
    // addToUserPool();
    const UserRecord: UserRecord = {
      ...(properties as Required<CreateRequest>),
      metadata: {
        lastSignInTime: null,
        creationTime: String(new Date()),
        toJSON() {
          return JSON.stringify(properties) as never;
        },
      },
      multiFactor: null as never,
      toJSON: () => null as never,
      providerData: null as never,
      emailVerified: false,
    };

    addToUserPool(UserRecord);

    return UserRecord;
  },

  /** Updates an existing user. */
  async updateUser(
    uid: string,
    properties: UpdateRequest
  ): Promise<UserRecord> {
    // let uid: uid;
    // if (typeof user !== 'string' && (isUser(user) || isMockUserRecord(user))) {
    //   uid = user.uid;
    // } else {
    //   uid = user;
    // }

    api.updateUser(uid, properties);
    return Promise.resolve(api.toUserRecord(api.getCurrentUser()));
  },
  async deleteUser(uid: string): Promise<void> {
    await networkDelay();
    removeUser(uid);
  },
  async getUserByEmail(email: string): Promise<UserRecord> {
    await networkDelay();
    return getUserByEmail(email);
  },
  async getUserByPhoneNumber(phoneNumber: string): Promise<UserRecord> {
    return Promise.resolve(
      api.toUserRecord(api.findKnownUser('phoneNumber', phoneNumber))
    );
  },
  async listUsers(
    maxResults?: undefined | number,
    pageToken?: undefined | string
  ): Promise<ListUsersResult> {
    await networkDelay();
    return { users: maxResults ? allUsers().slice(0, maxResults) : allUsers() };
  },
};
