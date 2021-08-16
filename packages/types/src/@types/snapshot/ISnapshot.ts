import { DocumentData } from '@firebase/firestore-types';
import { IFirestoreSnapshot, IRtdbDataSnapshot } from './index';

export type ISnapshot<T extends DocumentData = DocumentData> =
  | IRtdbDataSnapshot
  | IFirestoreSnapshot<T>;
