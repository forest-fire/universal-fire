import { IDictionary } from 'common-types';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';
export declare type ISortFns = (a: any, b: any) => number;
export declare const orderByChild: (child: string | number) => (a: IDictionary, b: IDictionary) => 0 | 1 | -1;
export declare const orderByKey: (a: IDictionary, b: IDictionary) => 0 | 1 | -1;
export declare const orderByValue: (a: IDictionary, b: IDictionary) => 0 | 1 | -1;
export declare function isOrderByChild(query: SerializedRealTimeQuery, fn: typeof orderByChild | typeof orderByKey): fn is typeof orderByChild;
