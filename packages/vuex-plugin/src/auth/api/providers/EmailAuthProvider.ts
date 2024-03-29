import { FireModelPluginError } from "~/errors/";
import { getDatabase } from "~/util/state-mgmt/database";
import type { AuthCredential } from 'universal-fire';

export class EmailAuthProvider {
  static credential(email: string, password: string): AuthCredential {
    const db = getDatabase();
    if (!db.authProviders) {
      throw new FireModelPluginError(
        `Attempt to call connect() was not possible because the current DB connection -- via universal-fire -- does not have a "authProviders" API available yet.`
      );
    }
    return db.authProviders.EmailAuthProvider.credential(email, password);
  }
}
