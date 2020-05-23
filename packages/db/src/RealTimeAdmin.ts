import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';
import { IAdminConfig, IMockConfig } from '@forest-fire/types';

/** The interface that the `RealTimeAdmin` class exposes */
export type IRealTimeAdmin = RTA;

export async function RealTimeAdmin(
  config?: IAdminConfig | IMockConfig
): Promise<IRealTimeAdmin> {
  return RTA.connect(config);
}
