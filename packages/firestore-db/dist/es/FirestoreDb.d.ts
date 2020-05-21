import { AbstractedDatabase } from '@forest-fire/abstracted-database';
import type { IAdminApp, IClientApp, IFirestoreDatabase, IFirestoreDbEvent } from '@forest-fire/types';
import type { SerializedFirestoreQuery } from '@forest-fire/serialized-query';
export declare abstract class FirestoreDb extends AbstractedDatabase {
    protected _database?: IFirestoreDatabase;
    protected _app: IClientApp | IAdminApp;
    protected get database(): IFirestoreDatabase;
    protected set database(value: IFirestoreDatabase);
    protected _isCollection(path: string | SerializedFirestoreQuery): boolean;
    protected _isDocument(path: string | SerializedFirestoreQuery): boolean;
    get mock(): any;
    getList<T = any>(path: string | SerializedFirestoreQuery<T>, idProp: string): Promise<T[]>;
    getPushKey(path: string): Promise<string>;
    getRecord<T = any>(path: string, idProp?: string): Promise<T>;
    getValue<T = any>(path: string): Promise<void>;
    update<T = any>(path: string, value: Partial<T>): Promise<void>;
    set<T = any>(path: string, value: T): Promise<void>;
    remove(path: string): Promise<void>;
    watch(target: string | SerializedFirestoreQuery, events: IFirestoreDbEvent | IFirestoreDbEvent[], cb: any): void;
    unWatch(events?: IFirestoreDbEvent[], cb?: any): void;
    ref(path?: string): void;
    private _removeDocument;
    private _removeCollection;
}
