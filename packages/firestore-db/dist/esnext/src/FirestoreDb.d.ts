import '@firebase/firestore';
import { AbstractedDatabase } from 'abstracted-database';
import { DocumentChangeType as IFirestoreDbEvent } from '@firebase/firestore-types';
import { ISerializedQuery } from '@forest-fire/types';
import { FirebaseFirestore } from '@firebase/firestore-types';
export declare abstract class FirestoreDb extends AbstractedDatabase {
    _database: FirebaseFirestore | undefined;
    /**
     * Returns the `_database`.
     */
    protected get database(): FirebaseFirestore;
    /**
     * Sets the `_database`.
     */
    protected set database(value: FirebaseFirestore);
    protected isCollection(path: string | ISerializedQuery): boolean;
    protected isDocument(path: string | ISerializedQuery): boolean;
    get mock(): void;
    getList<T = any>(path: string, idProp: string): Promise<T[]>;
    getPushKey(path: string): Promise<void>;
    getRecord<T = any>(path: string, idProp: string): Promise<T>;
    getValue<T = any>(path: string): Promise<void>;
    add<T = any>(path: string, value: T): Promise<void>;
    update<T = any>(path: string, value: Partial<T>): Promise<void>;
    set<T = any>(path: string, value: T): Promise<void>;
    remove(path: string): Promise<void>;
    watch(target: string | ISerializedQuery, events: IFirestoreDbEvent[], cb: any): void;
    unWatch(events: IFirestoreDbEvent[], cb?: any): void;
    ref(path?: string): void;
    private _removeDocument;
    private _removeCollection;
}