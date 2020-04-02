import { IClientConfig, IClientDatabase } from '@forest-fire/types';
import { FirestoreDb } from '@forest-fire/firestore-db';
import firebase from '@firebase/app';

export class FirestoreClient extends FirestoreDb implements IClientDatabase {
  protected async _initializeApp(config: IClientConfig) {
    this.app = firebase.initializeApp(config);
  }

  protected async _connect() {
    this.database = this.app.firestore!();
    return this;
  }
}
