export enum RtdbOrder {
  orderByChild = 'orderByChild',
  orderByKey = 'orderByKey',
  orderByValue = 'orderByValue',
}

export type IRtdbOrder = keyof typeof RtdbOrder;
export type IFirestoreOrder = IRtdbOrder | 'orderBy';
