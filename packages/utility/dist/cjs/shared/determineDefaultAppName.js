"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function determineDefaultAppName(config) {
    if (!config) {
        return '[DEFAULT]';
    }
    return config.name
        ? config.name
        : config.databaseURL
            ? config.databaseURL.replace(/.*https:\W*([\w-]*)\.((.|\n)*)/g, '$1')
            : '[DEFAULT]';
}
exports.determineDefaultAppName = determineDefaultAppName;
//# sourceMappingURL=determineDefaultAppName.js.map