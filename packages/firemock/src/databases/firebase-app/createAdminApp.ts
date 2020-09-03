import { FireMockError } from '@/errors';
import { IAdminApp, IMockStore } from '@forest-fire/types';
import { IDictionary } from 'common-types';

export type FirebaseMockAppFactory = (
  store: IMockStore<IDictionary>
) => IAdminApp;

export const createAdminApp: FirebaseMockAppFactory = (store) => ({
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
});
