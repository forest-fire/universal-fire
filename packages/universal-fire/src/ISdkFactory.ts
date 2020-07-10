import { IMockConfig } from '@forest-fire/types';

export interface ISdkFactory<TSdk, TConfig> {
  /** return a new instance of the `universal-fire` SDK */
  create: () => TSdk;
  /** return a new instance of the `universal-fire` SDK after connecting it to the database */
  connect: (config?: IMockConfig | TConfig) => Promise<TSdk>;
}
