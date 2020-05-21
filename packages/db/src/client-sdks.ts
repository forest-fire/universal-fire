import { IMockConfig, IClientConfig } from '@forest-fire/types';

export async function RealTimeClient(config?: IClientConfig | IMockConfig) {
  const constructor = (
    await import(
      /** webpackChunkName: "real-time-client" */ '@forest-fire/real-time-client'
    )
  ).RealTimeClient;
  return constructor.connect(config);
}

export async function FirestoreClient(config?: IClientConfig | IMockConfig) {
  const constructor = (
    await import(
      /** webpackChunkName: "firestore-client" */ '@forest-fire/firestore-client'
    )
  ).FirestoreClient;
  return constructor.connect(config);
}
