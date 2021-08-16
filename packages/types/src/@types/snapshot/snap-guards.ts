import { IRtdbDataSnapshot, ISnapshot } from './index';
import { IFirestoreSnapshot } from './snap-underlying';

export function isRealTimeSnapshot(snap: ISnapshot): snap is IRtdbDataSnapshot {
  return Object.keys(snap).includes('getPriority');
}

export function isFirestoreSnapshot<
  T extends Record<string, unknown> = Record<string, unknown>
>(snap: ISnapshot<T>): snap is IFirestoreSnapshot<T> {
  return !Object.keys(snap).includes('getPriority');
}
