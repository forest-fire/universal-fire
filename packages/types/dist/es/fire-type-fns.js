export function isMockConfig(config) {
    return config.mocking === true;
}
export function isRealDbConfig(config) {
    return config.mocking !== true;
}
/**
 * In a client SDK setting, this checks that the typing is NOT a mock
 * typing (and that apiKey and databaseURL are indeed set) and responds
 * by letting typescript know that it is a `IClientConfig` configuration.
 */
export function isClientConfig(config) {
    return config.mocking !== true &&
        config.apiKey !== undefined &&
        config.databaseURL !== undefined
        ? true
        : false;
}
export function isAdminConfig(config) {
    return config.mocking !== true && config.apiKey === undefined;
}
//# sourceMappingURL=fire-type-fns.js.map