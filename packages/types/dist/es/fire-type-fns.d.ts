import { IDatabaseConfig, IMockConfig, IAdminConfig, IClientConfig } from './@types/fire-types';
export declare function isMockConfig(config: IDatabaseConfig): config is IMockConfig;
export declare function isRealDbConfig(config: IDatabaseConfig): config is IAdminConfig | IClientConfig;
/**
 * In a client SDK setting, this checks that the typing is NOT a mock
 * typing (and that apiKey and databaseURL are indeed set) and responds
 * by letting typescript know that it is a `IClientConfig` configuration.
 */
export declare function isClientConfig(config?: IClientConfig | IMockConfig): config is IClientConfig;
export declare function isAdminConfig(config?: IAdminConfig | IMockConfig): config is IAdminConfig;
