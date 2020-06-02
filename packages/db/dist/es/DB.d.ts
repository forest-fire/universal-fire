import { ConstructorFor, IDictionary } from 'common-types';
import { IFirestoreClient, IRealTimeClient } from './index';
export declare type IDatabaseSdk = ConstructorFor<IFirestoreClient> | ConstructorFor<IRealTimeClient>;
export declare const DB: IDictionary<Function>;
