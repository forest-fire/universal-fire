import { FireError } from '@forest-fire/utility';

export class FirestoreDbError extends FireError {
  declare kind: 'firestore-db';
}
