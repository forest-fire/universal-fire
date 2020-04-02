import { AppOptions } from 'firebase-admin';
import { FirebaseOptions } from '@firebase/app-types';

/**
 * The interface that client databases must implement.
 */
export interface IClientDatabase {}

/**
 * Available admin configurations.
 */
export interface IAdminConfig extends AppOptions {
  /**
   * The ID of the service account to be used for signing custom tokens. This
   * can be found in the `client_email` field of a service account JSON file.
   */
  serviceAccountId: string;
  /**
   * The ID of the Google Cloud project associated with the App.
   */
  projectId: string;
}

/**
 * Available client configurations.
 */
export interface IClientConfig extends FirebaseOptions {
  /**
   * The URL of the database from which to read and write data.
   */
  databaseURL: string;
  /**
   * The ID of the Google Cloud project associated with the App.
   */
  projectId: string;
}

export interface ISerializedQuery {}
