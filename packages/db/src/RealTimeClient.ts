import { IClientConfig, IMockConfig } from '@forest-fire/types';
import type { RealTimeClient as RTC } from '@forest-fire/real-time-client';

/** The interface that the `RealTimeClient` class exposes */
export type IRealTimeClient = RTC;

export async function RealTimeClient(
  config?: IClientConfig | IMockConfig
): Promise<IRealTimeClient> {
  const constructor = (
    await import(
      /* webpackChunkName: "real-time-client" */ '@forest-fire/real-time-client'
    )
  ).RealTimeClient;
  return constructor.connect(config);
}
