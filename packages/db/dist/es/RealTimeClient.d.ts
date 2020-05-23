import { IClientConfig, IMockConfig } from '@forest-fire/types';
import type { RealTimeClient as RTC } from '@forest-fire/real-time-client';
/** The interface that the `RealTimeClient` class exposes */
export declare type IRealTimeClient = RTC;
export declare function RealTimeClient(config?: IClientConfig | IMockConfig): Promise<IRealTimeClient>;
