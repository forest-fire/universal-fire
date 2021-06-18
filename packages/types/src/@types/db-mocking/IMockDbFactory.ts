import { IDictionary } from 'common-types';
import { IDatabaseSdk } from '../database';
import { ISdk } from '../fire-types';
import { IMockAuthConfig, IMockData, IMockDatabase } from '../index';
import { IMockServerOptions } from './index';

/**
 * **IMockDbFactory**
 *
 * Provides a factory object which allows the asynchronous _creation_ of a mock database
 * and optionally an Auth service
 */
export interface IMockDbFactory {
  <T extends IDatabaseSdk<TSdk>, TSdk extends ISdk>(
    container: T,
    mockData: IMockData<IDictionary>,
    mockAuth: IMockAuthConfig,
    options: IMockServerOptions
  ): Promise<IMockDatabase<TSdk>>;
}
