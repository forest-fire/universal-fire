import '@firebase/firestore';
import firebase from '@firebase/app';
import { FirestoreDb } from '@forest-fire/firestore-db';
import { IClientConfig, IClientDatabase } from '@forest-fire/types';

export class FirestoreClient extends FirestoreDb implements IClientDatabase {
  protected async _initializeApp(config: IClientConfig) {
    this.app = firebase.initializeApp(config);
  }

  protected async _connect() {
    this.database = this.app.firestore!();
    return this;
  }

  public async auth() {
    await import('@firebase/auth');
    if (this.app.auth) {
      return this.app.auth();
    }
    throw new Error(
      'Attempt to use auth module without having installed Firebase auth dependency'
    );
  }
}
