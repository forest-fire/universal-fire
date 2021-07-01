/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDictionary } from 'common-types';
import { RtdbOrder } from '@forest-fire/types';
import { SerializedRealTimeQuery } from '@forest-fire/serialized-query';

export type ISortFns = (a: any, b: any) => number;

export const orderByChild = (child: string | number) => {
  return (a: IDictionary, b: IDictionary): -1 | 0 | 1 => {
    return a[child] > b[child] ? -1 : a[child] === b[child] ? 0 : 1;
  };
};

export const orderByKey = (a: IDictionary, b: IDictionary): -1 | 0 | 1 => {
  return a.id > b.id ? -1 : a.id === b.id ? 0 : 1;
};

export const orderByValue = (a: IDictionary, b: IDictionary): -1 | 0 | 1 => {
  return a.value > b.value ? -1 : a.value === b.value ? 0 : 1;
};

export function isOrderByChild<TSdk extends "RealTimeAdmin" | "RealTimeClient">(
  query: SerializedRealTimeQuery<TSdk>,
  fn: typeof orderByChild | typeof orderByKey
): fn is typeof orderByChild {
  return query.identity.orderBy === RtdbOrder.orderByChild;
}
