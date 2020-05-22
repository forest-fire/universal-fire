import { IAdminConfig, IMockConfig } from '@forest-fire/types';
import { IRealTimeAdmin } from './index';
export declare function RealTimeAdmin(config?: IAdminConfig | IMockConfig): Promise<IRealTimeAdmin>;
