import { ClientConfig, AbstractedDatabase } from '@forest-fire/types';
import { FirestoreDb } from '@forest-fire/firestore';

export class FirestoreClient extends FirestoreDb implements AbstractedDatabase {
  static connect(config: ClientConfig) {
    const db = new FirestoreClient(config);
    db.connect();
    return db;
  }
}
