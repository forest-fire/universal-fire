import { IDictionary } from 'common-types';
import { SerializedFirestoreQuery, SerializedRealTimeQuery } from '@forest-fire/serialized-query';
export interface ISimplifiedDb extends IDictionary {
    constructor: {
        name: string;
    };
}
export declare class SerializedQuery {
    static create<T = IDictionary>(db: ISimplifiedDb, path?: string): SerializedRealTimeQuery<T> | SerializedFirestoreQuery<T>;
}
