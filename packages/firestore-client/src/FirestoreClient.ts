import { ClientConfig, ClientDatabase } from '@forest-fire/types';
import { FirestoreDb } from '@forest-fire/firestore';
import firebase from '@firebase/app';

export class FirestoreClient extends FirestoreDb implements ClientDatabase {
  protected async _initializeApp(config: ClientConfig) {
    this.app = firebase.initializeApp(config);
  }

  protected async _connect() {
    this.database = this.app.firestore!();
    return this;
  }
}
