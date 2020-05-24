import { SerializedFirestoreQuery, SerializedRealTimeQuery } from '@forest-fire/serialized-query';
import { IDictionary } from 'common-types';
export interface ISimplifiedDb extends IDictionary {
    constructor: {
        name: string;
    };
}
export declare class SerializedQuery {
    static create<T = IDictionary>(db: ISimplifiedDb, path?: string): SerializedRealTimeQuery<T> | SerializedFirestoreQuery<T>;
}
