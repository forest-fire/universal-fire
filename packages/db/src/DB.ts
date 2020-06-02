import { ConstructorFor, IDictionary } from 'common-types';
import { IClientConfig, IFirestoreClient, IRealTimeClient } from './index';

export type IDatabaseSdk =
  | ConstructorFor<IFirestoreClient>
  | ConstructorFor<IRealTimeClient>;

export const DB: IDictionary<Function> = {
  create: (constructor: IDatabaseSdk, config?: IClientConfig) => {
    return new constructor(config);
  },
  async connect(constructor: IDatabaseSdk, config?: IClientConfig) {
    const obj = new constructor(config);
    await obj.connect();
    return obj;
  },
};
