import '@firebase/firestore';
import { FirestoreDb } from '@forest-fire/firestore-db';
import { IClientConfig, IClientDatabase } from '@forest-fire/types';
export declare class FirestoreClient extends FirestoreDb implements IClientDatabase {
    protected _initializeApp(config: IClientConfig): Promise<void>;
    protected _connect(): Promise<this>;
    auth(): Promise<import("@firebase/auth-types").FirebaseAuth>;
}
