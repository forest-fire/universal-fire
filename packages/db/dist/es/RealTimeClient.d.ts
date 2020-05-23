import type { IMockConfig, IClientConfig } from '@forest-fire/types';
import { RealTimeClient as RTC } from '@forest-fire/real-time-client';
export declare function RealTimeClient(config?: IClientConfig | IMockConfig): RTC;
