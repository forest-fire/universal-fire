import { AbstractedDatabase } from '@forest-fire/types';
import { Database } from '@forest-fire/database';
import '@firebase/firestore';

export abstract class FirestoreDb extends Database
  implements AbstractedDatabase {}
