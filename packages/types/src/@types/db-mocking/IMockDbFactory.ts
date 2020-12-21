import { IDictionary } from 'common-types';
import { IDatabaseApi } from '../database';
import { IMockAuthConfig, IMockData, IMockDatabase } from '../index';
import { IMockServerOptions } from './index';

/**
 * **IMockDbFactory**
 *
 * Provides a factory object which allows the asynchronous _creation_ of a mock database
 * and optionally an Auth service
 */
export interface IMockDbFactory {
  (
    container: IDatabaseApi,
    mockData: IMockData<IDictionary>,
    mockAuth: IMockAuthConfig,
    options: IMockServerOptions
  ): Promise<IMockDatabase>;
}
