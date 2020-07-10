import { IAdminConfig, IMockConfig, isAdminConfig } from '@forest-fire/types';
import { FireError } from '../errors';

/**
 * Initializes Firebase's App (for Admin SDK)
 *
 * @param fb the `firebase-admin` API surface
 * @param config the configuration to use for initialization
 */
export function initializeAdminApp(
  fb: {
    credential: { cert: (sa: any) => any };
    initializeApp: (config: { credential: any; databaseURL: string }) => any;
  },
  config: IAdminConfig | IMockConfig
) {
  try {
    if (isAdminConfig(config)) {
      const credential = fb.credential.cert(config.serviceAccount);
      const databaseURL = config.databaseURL;
      return fb.initializeApp({ credential, databaseURL });
    } else {
      throw new FireError(
        `Attempt to initialize Firebase App failed because the configuration passed in was not an Admin configuration! The configuration was:\n${JSON.stringify(
          config,
          null,
          2
        )}`
      );
    }
  } catch (e) {
    throw new FireError(
      `There were problems initializing the Admin SDK's Firebase App! The error reported was:\n\n${e.message}\n`,
      'firebase-app-failed'
    );
  }
}
