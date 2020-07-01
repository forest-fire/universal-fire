import { IDictionary } from 'common-types';
import type { IRtdbReference, IRtdbDataSnapshot, IRtdbThenableReference, IRtdbDbEvent } from '@forest-fire/types';
import { IFirebaseEventHandler, DelayType } from "../@types";
import { SnapShot, Query } from "./";
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
export declare class Reference<T = any> extends Query<T> implements IRtdbReference {
    static createQuery(query: string | SerializedRealTimeQuery, delay?: DelayType): Reference<any>;
    static create(path: string): Reference<any>;
    constructor(path: string, _delay?: DelayType);
    get key(): string | null;
    get parent(): IRtdbReference | null;
    child<C = any>(path: string): Reference;
    get root(): Reference;
    push(value?: any, onComplete?: (a: Error | null) => any): IRtdbThenableReference;
    remove(onComplete?: (a: Error | null) => any): Promise<void>;
    set(value: any, onComplete?: (a: Error | null) => any): Promise<void>;
    update(values: IDictionary, onComplete?: (a: Error | null) => any): Promise<void>;
    setPriority(priority: string | number | null, onComplete: (a: Error | null) => any): Promise<void>;
    setWithPriority(newVal: any, newPriority: string | number | null, onComplete: (a: Error | null) => any): Promise<void>;
    transaction(transactionUpdate: (a: Partial<T>) => Partial<T>, onComplete?: (a: Error | null, b: boolean, c: IRtdbDataSnapshot | null) => any, applyLocally?: boolean): Promise<{
        committed: boolean;
        snapshot: any;
        toJSON(): {};
    }>;
    onDisconnect(): any;
    toString(): string;
    protected getSnapshot<T extends IRtdbDataSnapshot>(key: string, value: any): SnapShot<T>;
    protected addListener(pathOrQuery: string | SerializedRealTimeQuery<any>, eventType: IRtdbDbEvent, callback: IFirebaseEventHandler, cancelCallbackOrContext?: (err?: Error) => void, context?: IDictionary): Promise<IRtdbDataSnapshot>;
}