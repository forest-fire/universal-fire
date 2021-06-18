import { IAdminFirestoreDatabase, IAdminRtdbDatabase, IClientFirestoreDatabase, IClientRtdbDatabase } from "../fire-proxies";
import { ISdk } from "../fire-types";
import { IRtdbSnapshot } from "../proxy-plus";
import { IFirebaseCollectionReference, IFirebaseRtdbQuery } from "../query";
import { IFirestoreQuerySnapshot } from "../snapshot";

export type DbFrom<T extends ISdk> = T extends "FirestoreAdmin"
  ? IAdminFirestoreDatabase
  : T extends "FirestoreClient"
  ? IClientFirestoreDatabase
  : T extends "RealTimeAdmin"
  ? IAdminRtdbDatabase
  : IClientRtdbDatabase;


/**
 * Given a known SDK, it will provide the appropriate type for a derserialized query
 */
export type DeserializedQueryFrom<T extends ISdk> = T extends "FirestoreAdmin" | "FirestoreClient" ? IFirebaseCollectionReference<any> : IFirebaseRtdbQuery;

export type SnapshotFrom<T extends ISdk> = T extends "FirestoreAdmin" | "FirestoreClient" ? IFirestoreQuerySnapshot<any> : IRtdbSnapshot;