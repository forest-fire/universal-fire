import { FireMockError } from '../../errors';
import {  IClientApp, IMockStore } from '@forest-fire/types';

export const createAdminApp = <T extends IMockStore<"RealTimeAdmin">>(store: T): IClientApp => ({
  name: store.config.name,
  auth() {
    throw new FireMockError(
      `database.auth() does not have an implementation in Firemock`
    );
  },
  database() {
    throw new FireMockError(
      `database.database() does not have an implementation in Firemock`
    );
  },
  delete() {
    throw new FireMockError(
      `database.delete() does not have an implementation in Firemock`
    );
  },
  // TODO: the types here need attention
} as unknown as IClientApp);
