import {
  IAdminFirebaseNamespace,
  IAdminConfig,
  IMockConfig,
  isAdminConfig,
} from '@forest-fire/types';

/**
 * Initializes the Admin's App and Database API's and returns them
 *
 * @param fb the `firebase-admin` API surface
 * @param config the configuration to use for initialization
 */
export function initializeAdminApis(
  fb: IAdminFirebaseNamespace,
  config: IAdminConfig | IMockConfig
) {
  if (isAdminConfig(config)) {
    //
  }
}
