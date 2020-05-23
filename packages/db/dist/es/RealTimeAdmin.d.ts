import { RealTimeAdmin as RTA } from '@forest-fire/real-time-admin';
import { IAdminConfig, IMockConfig } from '@forest-fire/types';
/** The interface that the `RealTimeAdmin` class exposes */
export declare type IRealTimeAdmin = RTA;
export declare function RealTimeAdmin(config?: IAdminConfig | IMockConfig): Promise<IRealTimeAdmin>;
