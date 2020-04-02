import { IClientConfig, IClientDatabase } from '@forest-fire/types';
import { FirestoreDb } from '@forest-fire/firestore-db';
export declare class FirestoreClient extends FirestoreDb implements IClientDatabase {
    protected _initializeApp(config: IClientConfig): Promise<void>;
    protected _connect(): Promise<this>;
}
