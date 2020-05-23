import type { IMockConfig, IAdminConfig } from '@forest-fire/types';
import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';

export function RealTimeAdmin(config?: IAdminConfig | IMockConfig) {
  const obj = new RTA(config);
  return obj;
}
