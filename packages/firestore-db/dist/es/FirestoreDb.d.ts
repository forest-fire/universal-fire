import { AbstractedDatabase, IAbstractedDatabase } from '@forest-fire/abstracted-database';
import type { IAdminApp, IClientApp, IFirestoreDatabase, IFirestoreDbEvent } from '@forest-fire/types';
import type { ISerializedQuery } from '@forest-fire/serialized-query';
import { IFirestoreDb } from './firestore-types';
export declare abstract class FirestoreDb extends AbstractedDatabase implements IFirestoreDb, IAbstractedDatabase {
    protected _database?: IFirestoreDatabase;
    protected _app: IClientApp | IAdminApp;
    protected get database(): IFirestoreDatabase;
    protected set database(value: IFirestoreDatabase);
    protected _isCollection(path: string | ISerializedQuery): boolean;
    protected _isDocument(path: string | ISerializedQuery): boolean;
    get mock(): any;
    getList<T = any>(path: string | ISerializedQuery<T>, idProp: string): Promise<T[]>;
    getPushKey(path: string): Promise<string>;
    getRecord<T = any>(path: string, idProp?: string): Promise<T>;
    getValue<T = any>(path: string): Promise<void>;
    update<T = any>(path: string, value: Partial<T>): Promise<void>;
    set<T = any>(path: string, value: T): Promise<void>;
    remove(path: string): Promise<void>;
    watch(target: string | ISerializedQuery, events: IFirestoreDbEvent | IFirestoreDbEvent[], cb: any): void;
    unWatch(events?: IFirestoreDbEvent[], cb?: any): void;
    ref(path?: string): void;
    private _removeDocument;
    private _removeCollection;
}
