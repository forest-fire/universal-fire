"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRunningApps = void 0;
/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
function getRunningApps(apps) {
    return apps.filter(i => i !== null).map(i => i.name);
}
exports.getRunningApps = getRunningApps;
//# sourceMappingURL=getRunningApps.js.map