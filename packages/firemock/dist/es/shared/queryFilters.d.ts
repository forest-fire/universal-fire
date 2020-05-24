import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
export declare function startAt(query: SerializedRealTimeQuery): (record: any) => boolean;
export declare function endAt(query: SerializedRealTimeQuery): (record: any) => boolean;
/** a filter function for queries with a `equalTo` value */
export declare function equalTo(query: SerializedRealTimeQuery): (record: any) => boolean;
