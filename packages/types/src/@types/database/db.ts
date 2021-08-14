import { IFirestoreDatabase, IRtdbDatabase } from '../fire-proxies';

export type IDatabase = IRtdbDatabase | IFirestoreDatabase;
