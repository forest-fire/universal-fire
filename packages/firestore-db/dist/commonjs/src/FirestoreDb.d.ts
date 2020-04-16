import { AbstractedDatabase } from 'abstracted-database';
import { DocumentChangeType as IFirestoreDbEvent, FirebaseFirestore } from '@firebase/firestore-types';
import { ISerializedQuery } from '@forest-fire/types';
export declare abstract class FirestoreDb extends AbstractedDatabase {
    protected _database: FirebaseFirestore | undefined;
    protected get database(): FirebaseFirestore;
    protected set database(value: FirebaseFirestore);
    protected _isCollection(path: string | ISerializedQuery): boolean;
    protected _isDocument(path: string | ISerializedQuery): boolean;
    get mock(): void;
    getList<T = any>(path: string | ISerializedQuery, idProp?: string): Promise<T[]>;
    getPushKey(path: string): Promise<string>;
    getRecord<T = any>(path: string, idProp?: string): Promise<T>;
    getValue<T = any>(path: string): Promise<void>;
    update<T = any>(path: string, value: Partial<T>): Promise<void>;
    set<T = any>(path: string, value: T): Promise<void>;
    remove(path: string): Promise<void>;
    watch(target: string | ISerializedQuery, events: IFirestoreDbEvent[], cb: any): void;
    unWatch(events: IFirestoreDbEvent[], cb?: any): void;
    ref(path?: string): void;
    private _removeDocument;
    private _removeCollection;
}
