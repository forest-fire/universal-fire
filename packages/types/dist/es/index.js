function isMockConfig(config) {
    return config && config.mocking === true;
}
function isRealDbConfig(config) {
    return config && config.mocking !== true;
}
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
function isAdminConfig(config) {
    return config &&
        config.mocking !== true &&
        config.apiKey === undefined &&
        config.databaseURL !== undefined
        ? true
        : false;
}

var RealQueryOrderType;
(function (RealQueryOrderType) {
    RealQueryOrderType["orderByChild"] = "orderByChild";
    RealQueryOrderType["orderByKey"] = "orderByKey";
    RealQueryOrderType["orderByValue"] = "orderByValue";
})(RealQueryOrderType || (RealQueryOrderType = {}));

export { RealQueryOrderType, isAdminConfig, isClientConfig, isMockConfig, isRealDbConfig };
//# sourceMappingURL=index.js.map
