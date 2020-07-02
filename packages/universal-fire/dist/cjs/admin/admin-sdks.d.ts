import { IFirestoreAdmin, IRealTimeAdmin } from '../sdk-types';
export declare class FirestoreAdmin {
    static connect(): Promise<IFirestoreAdmin>;
}
export declare class RealTimeAdmin {
    static connect(): Promise<IRealTimeAdmin>;
}
