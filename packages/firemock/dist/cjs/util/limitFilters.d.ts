import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
/** an filter function for queries with a `limitToFirst` value */
export declare function limitToFirst(query: SerializedRealTimeQuery): (list: any[]) => any[];
/** an filter function for queries with a `limitToLast` value */
export declare function limitToLast(query: SerializedRealTimeQuery): (list: any[]) => any[];
