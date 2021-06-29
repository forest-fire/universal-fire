import { isMockUserRecord, isUser } from '../../../auth/type-guards';
import { toUserRecord } from '../../../auth/util';
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
} from '@forest-fire/types';

export const users: (api: IMockAuthMgmt) => Partial<Auth> = (api) => ({
  // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
  // eslint-disable-next-line @typescript-eslint/require-await
  async createUser(properties: CreateRequest): Promise<UserRecord> {
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
    };

    api.addToUserPool(UserRecord);

    return UserRecord;
  },

  /** Updates an existing user (admin-sdk). */
  async updateUser(
    user: string | User | IMockUserRecord,
    properties: UpdateRequest
  ): Promise<UserRecord> {
    let uid: uid;
    if (typeof user !== 'string' && (isUser(user) || isMockUserRecord(user))) {
      uid = user.uid;
    } else {
      uid = user;
    }

    api.updateUser(uid, properties);
    return Promise.resolve(toUserRecord(api.getCurrentUser()));
  },
  async deleteUser(uid: string): Promise<void> {
    await api.networkDelay();
    api.removeFromUserPool(uid);
  },
  async getUserByEmail(email: string): Promise<UserRecord> {
    await api.networkDelay();
    return toUserRecord(api.findKnownUser('email', email));
  },
  async getUserByPhoneNumber(phoneNumber: string): Promise<UserRecord> {
    return Promise.resolve(
      toUserRecord(api.findKnownUser('phoneNumber', phoneNumber))
    );
  },
  async listUsers(
    maxResults?: undefined | number,
    pageToken?: undefined | string
  ): Promise<ListUsersResult> {
    await api.networkDelay();
    return {
      users: maxResults
        ? api.knownUsers().slice(0, maxResults)
        : api.knownUsers(),
    };
  },
});
