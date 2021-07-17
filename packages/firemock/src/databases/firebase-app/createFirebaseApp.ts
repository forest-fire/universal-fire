/* eslint-disable @typescript-eslint/require-await */
import { ISdk, IMockStore, IAdminApp, IClientApp, AdminSdk, isAdminSdk } from "@forest-fire/types";
import { FireMockError } from "~/errors";

export function createFirebaseApp<TSdk extends ISdk>(sdk: TSdk, store: IMockStore<TSdk>): TSdk extends AdminSdk ? IAdminApp : IClientApp {
  const client = {
    name: store.config.name,
    options: {},
    automaticDataCollectionEnabled: false,
    delete: async () => {
      throw new Error("delete() not implemented")
    },
  } as unknown as IClientApp;

  const admin = {
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
  } as unknown as IAdminApp

  return (isAdminSdk(sdk) ? admin : client) as TSdk extends AdminSdk ? IAdminApp : IClientApp;
}