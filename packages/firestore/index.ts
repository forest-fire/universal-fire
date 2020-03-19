import '@firebase/firestore';
import { ClientDatabase } from '@forest-fire/types';
import { Database } from '@forest-fire/database';

export class FirestoreDb extends Database implements ClientDatabase {
  public connect() {
    this.initializeApp();
    this.database = this.app.firestore();
  }
}
