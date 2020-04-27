"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns an array of named apps that are running under
 * Firebase's control (admin API)
 */
function runningApps(apps) {
    return apps.filter(i => i !== null).map(i => i.name);
}
exports.runningApps = runningApps;
//# sourceMappingURL=runningApps.js.map