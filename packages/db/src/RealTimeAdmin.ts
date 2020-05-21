import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';
import { IAdminConfig, IMockConfig } from '@forest-fire/types';

export async function RealTimeAdmin(config?: IAdminConfig | IMockConfig) {
  return RTA.connect(config);
}
