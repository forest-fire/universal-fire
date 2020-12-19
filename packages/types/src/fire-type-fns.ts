import { IFirestoreQuery, IRealTimeQuery } from './@types';
import type {
  IAdminConfig,
  IClientConfig,
  IDatabaseConfig,
  IMockConfig,
} from './index';

export function isMockConfig(config: IDatabaseConfig): config is IMockConfig {
  return config && (config as IMockConfig).mocking === true;
}

/**
 * Provides a type guard, ensuring payload is a **Firestore** query
 */
export function isRealTimeQuery(
  query: Record<string, unknown> | IRealTimeQuery | IFirestoreQuery
): query is IRealTimeQuery {
  // even though the orderByPriority is shit, it is a distinquishing
  // characteristic on RTDB not found elsewhere
  return (query as IRealTimeQuery).orderByPriority ? true : false;
}

/**
 * Provides a type guard, ensuring payload is a **Firestore** query
 */
export function isFirestoreQuery(
  query: Record<string, unknown> | IRealTimeQuery | IFirestoreQuery
): query is IRealTimeQuery {
  // where is the most query operator but it does not exist on RTDB,
  // TODO: this will need re-evaluation if we ever support non-Firebase databases
  return (query as IFirestoreQuery).where ? true : false;
}

export function isRealDbConfig(
  config: IDatabaseConfig
): config is IAdminConfig | IClientConfig {
  return config && config.mocking !== true;
}

/**
 * In a client SDK setting, this checks that the typing is NOT a mock
 * typing (and that apiKey and databaseURL are indeed set) and responds
 * by letting typescript know that it is a `IClientConfig` configuration.
 */
export function isClientConfig(
  config?: IClientConfig | IAdminConfig | IMockConfig
): config is IClientConfig {
  return config &&
    config.mocking !== true &&
    (config as IClientConfig).apiKey !== undefined &&
    (config as IClientConfig).databaseURL !== undefined
    ? true
    : false;
}

export function isAdminConfig(
  config?: IAdminConfig | IMockConfig
): config is IAdminConfig {
  return config &&
    config.mocking !== true &&
    config.apiKey === undefined &&
    config.databaseURL !== undefined
    ? true
    : false;
}
