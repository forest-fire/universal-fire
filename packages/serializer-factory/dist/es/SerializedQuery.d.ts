import { SerializedFirestoreQuery, SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { IDictionary } from 'common-types';
import type { IAbstractedDatabase } from '@forest-fire/abstracted-database';
export interface ISimplifiedDb extends IDictionary {
    constructor: {
        name: string;
    };
}
export declare class SerializedQuery {
    static create<T = IDictionary>(db: IAbstractedDatabase, path?: string): SerializedRealTimeQuery<T> | SerializedFirestoreQuery<T>;
}
