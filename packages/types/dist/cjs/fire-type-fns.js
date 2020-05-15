"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminConfig = exports.isClientConfig = exports.isRealDbConfig = exports.isMockConfig = void 0;
function isMockConfig(config) {
    return config && config.mocking === true;
}
exports.isMockConfig = isMockConfig;
function isRealDbConfig(config) {
    return config && config.mocking !== true;
}
exports.isRealDbConfig = isRealDbConfig;
/**
 * In a client SDK setting, this checks that the typing is NOT a mock
 * typing (and that apiKey and databaseURL are indeed set) and responds
 * by letting typescript know that it is a `IClientConfig` configuration.
 */
function isClientConfig(config) {
    return config &&
        config.mocking !== true &&
        config.apiKey !== undefined &&
        config.databaseURL !== undefined
        ? true
        : false;
}
exports.isClientConfig = isClientConfig;
function isAdminConfig(config) {
    return config &&
        config.mocking !== true &&
        config.apiKey === undefined &&
        config.databaseURL !== undefined
        ? true
        : false;
}
exports.isAdminConfig = isAdminConfig;
//# sourceMappingURL=fire-type-fns.js.map