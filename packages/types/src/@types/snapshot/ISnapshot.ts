import { IFirestoreSnapshot, IRtdbDataSnapshot } from './index';

export type ISnapshot<
  T extends Record<string, unknown> = Record<string, unknown>
> = IRtdbDataSnapshot | IFirestoreSnapshot<T>;
