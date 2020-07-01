import { FireError } from '@forest-fire/utility';

export class FirestoreDbError extends FireError {
  kind: 'firestore-db';
}
