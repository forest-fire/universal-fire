import { IMockConfig, IClientConfig } from '@forest-fire/types';
export declare function RealTimeClient(config?: IClientConfig | IMockConfig): Promise<import("@forest-fire/real-time-client").RealTimeClient>;
export declare function FirestoreClient(config?: IClientConfig | IMockConfig): Promise<import("@forest-fire/firestore-client").FirestoreClient>;
