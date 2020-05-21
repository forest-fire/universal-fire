import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';
import { IAdminConfig, IMockConfig } from '@forest-fire/types';
export declare function RealTimeAdmin(config?: IAdminConfig | IMockConfig): Promise<RTA>;
