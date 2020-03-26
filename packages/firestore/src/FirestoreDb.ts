import '@firebase/firestore';
import { ClientDatabase } from '@forest-fire/types';
import { Database } from '@forest-fire/database';

export abstract class FirestoreDb extends Database implements ClientDatabase {
  public connect() {
    this.database = this.app.firestore!();
  }
}
