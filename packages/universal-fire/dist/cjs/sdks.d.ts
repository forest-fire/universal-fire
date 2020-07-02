import { IFirestoreAdmin, IRealTimeAdmin } from './index';
export { RealTimeClient } from '@forest-fire/real-time-client';
export { FirestoreClient } from '@forest-fire/firestore-client';
export declare class FirestoreAdmin {
    static connect(): Promise<IFirestoreAdmin>;
}
export declare class RealTimeAdmin {
    static connect(): Promise<IRealTimeAdmin>;
}
