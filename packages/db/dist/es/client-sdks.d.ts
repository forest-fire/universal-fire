import { IMockConfig, IClientConfig } from '@forest-fire/types';
import { IRealTimeClient, IFirestoreClient } from './index';
export declare function RealTimeClient(config?: IClientConfig | IMockConfig): Promise<IRealTimeClient>;
export declare function FirestoreClient(config?: IClientConfig | IMockConfig): Promise<IFirestoreClient>;
