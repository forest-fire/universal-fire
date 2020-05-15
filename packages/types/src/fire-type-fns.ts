import {
  IAdminConfig,
  IClientConfig,
  IDatabaseConfig,
  IMockConfig,
} from './index';

export function isMockConfig(config: IDatabaseConfig): config is IMockConfig {
  return config && (config as IMockConfig).mocking === true;
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
  config?: IClientConfig | IMockConfig
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
    (config as any).apiKey === undefined &&
    (config as any).databaseURL !== undefined
    ? true
    : false;
}
