import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';
import { IAdminConfig, IMockConfig } from '@forest-fire/types';
import { IRealTimeAdmin } from './index';

export async function RealTimeAdmin(
  config?: IAdminConfig | IMockConfig
): Promise<IRealTimeAdmin> {
  return RTA.connect(config);
}
