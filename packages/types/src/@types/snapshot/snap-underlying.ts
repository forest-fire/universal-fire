import { DocumentData } from '@firebase/firestore-types';

// RTDB
export type IRtdbDataSnapshot = import('@firebase/database-types').DataSnapshot;

// Firestore
export type IFirestoreSnapshot<T = DocumentData> =
  | IFirestoreDataSnapshot<T>
  | IFirestoreQueryDocumentSnapshot<T>
  | IFirestoreQuerySnapshot<T>;

export type IFirestoreQuerySnapshot<
  T = DocumentData
> = import('@firebase/firestore-types').QuerySnapshot<T>;
export type IFirestoreDataSnapshot<
  T = DocumentData
> = import('@firebase/firestore-types').DocumentSnapshot<T>;
export type IFirestoreQueryDocumentSnapshot<
  T = DocumentData
> = import('@firebase/firestore-types').QueryDocumentSnapshot<T>;
