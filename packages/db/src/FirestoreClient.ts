import type { IClientConfig, IMockConfig } from '@forest-fire/types';
import type { FirestoreClient as FSC } from '@forest-fire/firestore-client';

/** The interface that the `FirestoreClient` class exposes */
export type IFirestoreClient = FSC;

export async function FirestoreClient(
  config?: IClientConfig | IMockConfig
): Promise<IFirestoreClient> {
  const constructor = (
    await import(
      /* webpackChunkName: "firestore-client" */ '@forest-fire/firestore-client'
    )
  ).FirestoreClient;
  return constructor.connect(config);
}
